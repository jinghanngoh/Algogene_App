import logging
import json
import os
import asyncio
import sqlite3
import uvicorn
import sys
import websocket
import threading
import random
import time
from fastapi import FastAPI, HTTPException, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from datetime import datetime
from pydantic import BaseModel
from typing import List, Optional
from MarketDataConnection import MarketDataConnection

# Load environment variables
load_dotenv()
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "algogene_app.db")
WATCHLIST_PATH = os.path.join(BASE_DIR, "watchlist_data.json")
WS_URL = "wss://algogene.com/ws"
API_KEY = os.getenv("ALGOGENE_API_KEY", "4WE4Qd010AqNZc9W701ZmR0U8I1d3mHl")

# Global flag to control WebSocket running state
watchlist_data = {} 
subscribed_symbols = ["BTCUSD", "ETHUSD"]
ws_connection = None
running = True
connected_websockets = set() 

# Models
class WatchlistUpdate(BaseModel):
    symbols: List[str]

# Helper functions
def save_watchlist_update(symbol, price, change_percent):
    logger = logging.getLogger(__name__)
    try:
        # Load existing data
        data = {}
        if os.path.exists(WATCHLIST_PATH) and os.path.getsize(WATCHLIST_PATH) > 0:
            try:
                with open(WATCHLIST_PATH, "r") as f:
                    data = json.load(f)
            except json.JSONDecodeError:
                logger.error(f"Error loading JSON from {WATCHLIST_PATH}, creating new file")
        
        # Update data for this symbol
        if symbol not in data:
            data[symbol] = {}
        
        data[symbol]["previous_price"] = data[symbol].get("current_price")
        data[symbol]["current_price"] = price
        
        # Calculate change percent if previous price exists
        if data[symbol]["previous_price"]:
            change_percent = ((price - data[symbol]["previous_price"]) / data[symbol]["previous_price"]) * 100
        
        data[symbol]["change_percent"] = change_percent
        data[symbol]["timestamp"] = datetime.now().isoformat()
        
        # Save the updated data
        with open(WATCHLIST_PATH, "w") as f:
            json.dump(data, f, indent=2)
        
        logger.debug(f"Saved watchlist update for {symbol} with price {price:.2f}")
    except Exception as e:
        logger.error(f"Error saving watchlist update: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Set up logging to both file and console
    logging.basicConfig(
        level=logging.DEBUG,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[
            logging.FileHandler(os.path.join(BASE_DIR, "app.log")),
            logging.StreamHandler(sys.stdout)
        ]
    )
    logger = logging.getLogger(__name__)
    logger.debug("Starting lifespan event")

    # Initialize SQLite database
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS subaccounts
                     (id TEXT PRIMARY KEY, broker TEXT, algorithm TEXT, currency TEXT, leverage TEXT, subscriptionEnd TEXT, 
                      algo_id TEXT, availableBalance REAL, cashBalance REAL, realizedPL REAL, unrealizedPL REAL, 
                      marginUsed REAL, status TEXT, brokerConnected INTEGER, brokerApiKey TEXT, brokerSecret TEXT)''')
    conn.commit()
    logger.debug("Table subaccounts created or already exists")
    conn.close()

    if not os.path.exists(WATCHLIST_PATH):
        with open(WATCHLIST_PATH, "w") as f:
            f.write("")
        logger.debug(f"Created empty {WATCHLIST_PATH}")

    # Start WebSocket client
    start_websocket()
    
    yield
    logger.debug("Shutting down lifespan event")
    global running
    running = False

app = FastAPI(lifespan=lifespan)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:19006", "http://localhost", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize MarketDataConnection
market_data = MarketDataConnection()

class WatchlistUpdate(BaseModel):
    symbols: list[str]

def on_message(ws, message):
    logger = logging.getLogger(__name__)
    global watchlist_data
    
    try:
        data = json.loads(message)
        logger.debug(f"Received: {data}")
        
        # Handle server ping
        if "msg" in data and data.get("msg") == "server ping":
            logger.info("Sent client pong to ALGOGENE")
            ws.send(json.dumps({"msg_id": 0, "msg": "client pong"}))
            return
            
        # Process market data
        if "symbol" in data:
            symbol = data["symbol"]
            logger.info(f"Processing market data for {symbol}")
            
            # Calculate mid price or use bid price
            if "bidPrice" in data and "askPrice" in data:
                price = (data["bidPrice"] + data["askPrice"]) / 2
            elif "bidPrice" in data:
                price = data["bidPrice"]
            else:
                logger.warning(f"No price data found for {symbol}")
                return
                
            # Update watchlist data
            if symbol not in watchlist_data:
                watchlist_data[symbol] = {"previous_price": None, "current_price": None, "change_percent": None}
                
            prev_price = watchlist_data[symbol]["current_price"]
            watchlist_data[symbol]["previous_price"] = prev_price
            watchlist_data[symbol]["current_price"] = price
            
            # Calculate percent change
            if prev_price:
                change_percent = ((price - prev_price) / prev_price) * 100
                watchlist_data[symbol]["change_percent"] = change_percent
            else:
                watchlist_data[symbol]["change_percent"] = 0.0
                
            logger.info(f"Watchlist update: {symbol} - Price: {price:.2f}, Change: {watchlist_data[symbol].get('change_percent', 0):.2f}%")
            
            # Save to file for persistence
            save_watchlist_update(symbol, price, watchlist_data[symbol].get("change_percent", 0))
            
            # Notify WebSocket clients
            asyncio.run_coroutine_threadsafe(notify_clients(), asyncio.get_event_loop())
    except Exception as e:
        logger.error(f"Error processing WebSocket message: {e}")

def on_error(ws, error):
    logger = logging.getLogger(__name__)
    logger.error(f"WebSocket error: {error}")


def on_close(ws, close_status_code, close_msg):
    if not running:
        return
    logger = logging.getLogger(__name__)
    logger.info(f"WebSocket closed with code: {close_status_code}, message: {close_msg}")
    global ws_connection
    ws_connection = None

def on_open(ws):
    logger = logging.getLogger(__name__)
    global ws_connection
    
    ws_connection = ws
    logger.info("Connected to ALGOGENE WebSocket")
    
    # Subscribe to market data for both BTCUSD and ETHUSD
    msg = json.dumps({
        "msg_id": 13,
        "user": "demo2",
        "api_key": API_KEY,
        "symbols": subscribed_symbols,  # This should contain both BTCUSD and ETHUSD
        "broker": ""
    })
    ws.send(msg)
    logger.info(f"Sent subscription message for {subscribed_symbols}")
    
    # Set up periodic ping
    def send_ping():
        while ws.sock and ws.sock.connected:
            try:
                ws.send(json.dumps({"msg_id": 0, "msg": "client ping"}))
                logger.info("Sent client ping to ALGOGENE")
                time.sleep(30)
            except Exception as e:
                logger.error(f"Error sending ping: {e}")
                break
    
    threading.Thread(target=send_ping, daemon=True).start()

def connect_websocket():
    logger = logging.getLogger(__name__)
    ws_url = "wss://algogene.com/ws"
    attempt = 1
    global running
    while running:
        try:
            logger.debug(f"Attempting WebSocket connection (attempt {attempt})")
            ws = websocket.WebSocketApp(
                ws_url,
                on_message=on_message,
                on_error=on_error,
                on_close=on_close,
                on_open=on_open
            )
            ws.run_forever(ping_interval=15, ping_timeout=10)  # Reduced ping_interval
        except Exception as e:
            if not running:
                break
            logger.error(f"WebSocket connection failed: {e}")
            wait_time = min(5 * attempt, 60)
            logger.info(f"Reconnecting in {wait_time} seconds...")
            time.sleep(wait_time)
            attempt += 1
        except KeyboardInterrupt:
            logger.info("KeyboardInterrupt received, stopping...")
            running = False
            break
    logger.info("WebSocket client stopped.")

def start_websocket():
    """Start the WebSocket connection in a separate thread."""
    logger = logging.getLogger(__name__)
    logger.info("Starting WebSocket client thread")
    threading.Thread(target=connect_websocket, daemon=True).start()

@app.get("/watchlist")
async def get_watchlist():  # Remove the self parameter since this is not a class method
    logger = logging.getLogger(__name__)
    result = []
    
    try:
        # Process BTC/USD data from the file
        if os.path.exists(WATCHLIST_PATH) and os.path.getsize(WATCHLIST_PATH) > 0:
            try:
                with open(WATCHLIST_PATH, "r") as f:
                    data = json.load(f)
                    for symbol, item_data in data.items():
                        if "current_price" in item_data and item_data["current_price"] is not None:
                            name = f"{symbol[:3]} / {symbol[3:]}"
                            price = item_data["current_price"]
                            change = item_data.get("change_percent", 0)
                            
                            change_str = f"{'+' if change >= 0 else ''}{change:.2f}%"
                            
                            result.append({
                                "name": name,
                                "symbol": symbol,
                                "price": f"{price:.2f}",
                                "change": change_str,
                                "icon": f"https://example.com/icons/{symbol.lower()}.png"
                            })
                            logger.info(f"Added {symbol} to watchlist response with price {price:.2f}")
            except json.JSONDecodeError:
                logger.error(f"Error parsing JSON from {WATCHLIST_PATH}")
                # If the file exists but isn't valid JSON, we need to handle this case
                
        # If we already have ETHUSD in the result, don't add it again
        if not any(item["symbol"] == "ETHUSD" for item in result):
            logger.info("No ETH/USD data found in file, adding placeholder")
            
            # Add ETH/USD with data from CoinGecko API
            import requests
            try:
                response = requests.get("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true")
                data = response.json()
                eth_price = data["ethereum"]["usd"]
                eth_change = data["ethereum"]["usd_24h_change"]
                
                result.append({
                    "name": "ETH / USD",
                    "symbol": "ETHUSD",
                    "price": f"{eth_price:.2f}",
                    "change": f"{'+' if eth_change >= 0 else ''}{eth_change:.2f}%",
                    "icon": "https://example.com/icons/ethusd.png"
                })
                logger.info(f"Added ETHUSD to watchlist response with price {eth_price:.2f} from CoinGecko")
            except Exception as e:
                logger.error(f"Error fetching ETH price from CoinGecko: {e}")
                # Fallback to fixed value if API fails
                result.append({
                    "name": "ETH / USD",
                    "symbol": "ETHUSD",
                    "price": "3874.50",
                    "change": "+0.00%",
                    "icon": "https://example.com/icons/ethusd.png"
                })
                logger.info("Added ETHUSD to watchlist response with fallback price")
        
        # Also make sure BTCUSD is in the result if it's not already
        if not any(item["symbol"] == "BTCUSD" for item in result):
            logger.info("No BTC/USD data found in file, adding placeholder")
            import requests
            try:
                response = requests.get("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true")
                data = response.json()
                btc_price = data["bitcoin"]["usd"]
                btc_change = data["bitcoin"]["usd_24h_change"]
                
                result.append({
                    "name": "BTC / USD",
                    "symbol": "BTCUSD",
                    "price": f"{btc_price:.2f}",
                    "change": f"{'+' if btc_change >= 0 else ''}{btc_change:.2f}%",
                    "icon": "https://example.com/icons/btcusd.png"
                })
                logger.info(f"Added BTCUSD to watchlist response with price {btc_price:.2f} from CoinGecko")
            except Exception as e:
                logger.error(f"Error fetching BTC price from CoinGecko: {e}")
                # Fallback to fixed value if API fails
                result.append({
                    "name": "BTC / USD",
                    "symbol": "BTCUSD",
                    "price": "115245.00",
                    "change": "+0.00%",
                    "icon": "https://example.com/icons/btcusd.png"
                })
                logger.info("Added BTCUSD to watchlist response with fallback price")
        
        logger.info(f"Returning watchlist with {len(result)} items: {result}")
        return result
    except Exception as e:
        logger.error(f"Error in get_watchlist: {e}")
        return []

@app.post("/watchlist/update")
async def update_watchlist(update: WatchlistUpdate):
    logger = logging.getLogger(__name__)
    global subscribed_symbols, watchlist_data
    
    valid_symbols = ["BTCUSD", "ETHUSD"]
    new_symbols = [s for s in update.symbols if s in valid_symbols]
    
    # Log the request and validated symbols
    logger.info(f"Watchlist update request with symbols: {update.symbols}")
    logger.info(f"Validated symbols: {new_symbols}")
    
    if not new_symbols:
        logger.error("No valid symbols provided in update request")
        raise HTTPException(status_code=400, detail="No valid symbols provided")
    
    # Update global state with the new symbols
    old_symbols = subscribed_symbols.copy()
    subscribed_symbols = new_symbols
    
    # Log the updated subscription list
    logger.info(f"Updated subscribed symbols from {old_symbols} to {subscribed_symbols}")
    
    # Update WebSocket subscription if connection exists
    global ws_connection
    if ws_connection:
        msg = json.dumps({
            "msg_id": 13,
            "user": "demo2",
            "api_key": API_KEY,
            "symbols": subscribed_symbols,
            "broker": ""
        })
        try:
            ws_connection.send(msg)
            logger.info(f"Sent updated subscription for {subscribed_symbols}")
        except Exception as e:
            logger.error(f"Failed to update WebSocket subscription: {e}")
    else:
        logger.warning("No active WebSocket connection to update subscription")
    
    return {"status": "success", "symbols": subscribed_symbols}



@app.post("/rest/v1/app_subaccounts")
async def save_subaccounts(request: Request):
    logger = logging.getLogger(__name__)
    try:
        data = await request.json()
        logger.debug("Received request data: %s", data)
        session_id = data.get("sid")
        user = data.get("user")
        api_key = data.get("api_key")
        subaccounts = data.get("subAccounts")
        logger.debug("Parsed data: sid=%s, user=%s, api_key=%s, subaccounts=%s", session_id, user, api_key, subaccounts)

        if not subaccounts or not isinstance(subaccounts, list):
            logger.error("Invalid or missing subAccounts data")
            raise HTTPException(status_code=400, detail="subAccounts must be a non-empty list")

        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        prepared_data = [
            (
                sub.get("id", ""),
                sub.get("broker", ""),
                sub.get("algorithm", ""),
                sub.get("currency", ""),
                sub.get("leverage", ""),
                sub.get("subscriptionEnd", ""),
                sub.get("algoId", ""),
                float(sub.get("availableBalance", 0)),
                float(sub.get("cashBalance", 0)),
                float(sub.get("realizedPL", 0)),
                float(sub.get("unrealizedPL", 0)),
                float(sub.get("marginUsed", 0)),
                sub.get("status", ""),
                int(sub.get("brokerConnected", 0)),
                sub.get("brokerApiKey", ""),
                sub.get("brokerSecret", "")
            ) for sub in subaccounts
        ]
        cursor.executemany(
            "INSERT OR REPLACE INTO subaccounts (id, broker, algorithm, currency, leverage, subscriptionEnd, algoId, availableBalance, cashBalance, realizedPL, unrealizedPL, marginUsed, status, brokerConnected, brokerApiKey, brokerSecret) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            prepared_data
        )
        conn.commit()
        logger.debug("Subaccounts saved successfully")
        return {"status": True}
    except ValueError as e:
        logger.error("Invalid JSON data: %s", str(e))
        raise HTTPException(status_code=400, detail="Invalid JSON data")
    except sqlite3.Error as e:
        logger.error("Database error: %s", str(e))
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        logger.error("Unexpected error: %s", str(e))
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
    finally:
        if 'conn' in locals():
            conn.close()

@app.websocket("/ws/watchlist")
async def websocket_watchlist(websocket: WebSocket):
    logger = logging.getLogger(__name__)
    await websocket.accept()
    connected_websockets.add(websocket)
    logger.debug("WebSocket client connected")
    
    try:
        # Send initial data including both symbols
        initial_data = await get_watchlist()
        await websocket.send_json(initial_data)
        logger.info(f"Sent initial watchlist data via WebSocket: {initial_data}")
        
        # Keep connection alive and wait for any messages
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        if websocket in connected_websockets:
            connected_websockets.remove(websocket)
        logger.debug("WebSocket client disconnected")

async def notify_clients():
    logger = logging.getLogger(__name__)
    if connected_websockets:
        latest_data = await get_watchlist()
        for websocket in connected_websockets:
            try:
                await websocket.send_json(latest_data)
            except Exception as e:
                logger.error(f"Error sending to client: {e}")
                if websocket in connected_websockets:
                    connected_websockets.remove(websocket)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

