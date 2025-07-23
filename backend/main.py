import logging
import json
import os
import asyncio
import sqlite3
import uvicorn
import sys
import websocket
import threading
import time
from fastapi import FastAPI, HTTPException, Request, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from datetime import datetime
from MarketDataConnection import MarketDataConnection

# Load environment variables
load_dotenv()
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "algogene_app.db")
WATCHLIST_PATH = os.path.join(BASE_DIR, "watchlist_data.json")

# Global flag to control WebSocket running state
running = True

# Dictionary to store the previous price for each symbol
watchlist_data = {
    "BTCUSD": {"previous_price": None, "current_price": None, "change_percent": None}
}

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

def on_message(ws, message):
    """Handle incoming WebSocket messages."""
    if not running:
        return
    logger = logging.getLogger(__name__)
    try:
        data = json.loads(message)
        logger.debug(f"Received: {data}")
        
        if data.get("msg_id") == 0:
            # Respond to server ping with client pong
            ws.send(json.dumps({"msg_id": 0, "status": True, "msg": "client pong"}))
            logger.info("Sent client pong to ALGOGENE")
        elif data.get("msg_id") == -1:
            logger.warning(f"Server message: {data.get('msg')}")
        else:
            # Process market data
            symbol = data.get("symbol")
            bid_price = float(data.get("bidPrice", 0))
            ask_price = float(data.get("askPrice", 0))
            if symbol in watchlist_data and bid_price and ask_price:
                # Calculate mid price
                current_price = (bid_price + ask_price) / 2
                # Update watchlist data
                watchlist_data[symbol]["previous_price"] = watchlist_data[symbol]["current_price"]
                watchlist_data[symbol]["current_price"] = current_price
                # Calculate percentage change
                if watchlist_data[symbol]["previous_price"] is not None:
                    previous_price = watchlist_data[symbol]["previous_price"]
                    watchlist_data[symbol]["change_percent"] = (
                        (current_price - previous_price) / previous_price * 100
                    ) if previous_price != 0 else 0
                else:
                    watchlist_data[symbol]["change_percent"] = 0.0  # Set to 0 for first update
                # Log update
                change_percent = watchlist_data[symbol]["change_percent"]
                change_str = f"{change_percent:.2f}" if change_percent is not None else "0.00"
                logger.info(
                    f"Watchlist update: {symbol} - Price: {current_price:.2f}, "
                    f"Change: {change_str}%"
                )
                # Save to JSON Lines file
                try:
                    with open(WATCHLIST_PATH, "a") as f:
                        f.write(
                            json.dumps(
                                {
                                    "timestamp": data.get("timestamp", datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")),
                                    "symbol": symbol,
                                    "price": current_price,
                                    "change_percent": change_percent,
                                    "broker": data.get("broker", "Unknown")
                                }
                            ) + "\n"
                        )
                except PermissionError as e:
                    logger.error(f"Failed to write to {WATCHLIST_PATH}: {e}")
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse message as JSON: {e}, Raw message: {message}")
    except Exception as e:
        logger.error(f"Unexpected error in on_message: {e}")

def on_error(ws, error):
    """Handle WebSocket errors."""
    if not running:
        return
    logger = logging.getLogger(__name__)
    logger.error(f"WebSocket error: {error}")

def on_close(ws, close_status_code, close_msg):
    """Handle WebSocket closure."""
    if not running:
        return
    logger = logging.getLogger(__name__)
    logger.info(f"WebSocket closed with code: {close_status_code}, message: {close_msg}")

def on_open(ws):
    """Handle WebSocket connection opening."""
    if not running:
        return
    logger = logging.getLogger(__name__)
    logger.info("Connected to ALGOGENE WebSocket")
    # Send subscription message
    api_key = os.getenv("ALGOGENE_API_KEY", "4WE4Qd010AqNZc9W701ZmR0U8I1d3mHl")
    msg = json.dumps({
        "msg_id": 13,
        "user": "demo2",
        "api_key": api_key,
        "symbols": ["BTCUSD"],
        "broker": ""
    })
    try:
        ws.send(msg)
        logger.info("Sent subscription message")
    except Exception as e:
        logger.error(f"Failed to send subscription message: {e}")

    # Start keep-alive pings
    def send_ping():
        while running:
            try:
                time.sleep(25)
                if not running:
                    break
                ws.send(json.dumps({"msg_id": 0, "status": True, "msg": "client ping"}))
                logger.info("Sent client ping to ALGOGENE")
            except Exception as e:
                logger.error(f"Ping failed: {e}")
                break

    threading.Thread(target=send_ping, daemon=True).start()

def connect_websocket():
    """Connect to ALGOGENE WebSocket with reconnection logic."""
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
            ws.run_forever(ping_interval=30, ping_timeout=10)
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
async def get_watchlist():
    logger = logging.getLogger(__name__)
    latest_data = {"BTCUSD": {}}
    try:
        if os.path.exists(WATCHLIST_PATH):
            with open(WATCHLIST_PATH, "r") as f:
                lines = f.readlines()
                for line in reversed(lines):
                    entry = json.loads(line.strip())
                    symbol = entry["symbol"]
                    if symbol == "BTCUSD" and not latest_data[symbol]:
                        latest_data[symbol] = {
                            "name": "BTC / USD",
                            "symbol": symbol,
                            "price": f"{entry['price']:.2f}",
                            "change": f"{'+' if entry['change_percent'] >= 0 else ''}{entry['change_percent']:.2f}%"
                        }
                        break
    except Exception as e:
        logger.error(f"Error reading watchlist data: {e}")
    return [data for data in latest_data.values() if data]

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
    logger.debug("WebSocket client connected")
    try:
        # Send initial watchlist data
        initial_data = market_data.get_watchlist()
        await websocket.send_json(initial_data)
        
        # Watch for file changes
        last_modified = 0
        while True:
            if os.path.exists(WATCHLIST_PATH):
                current_modified = os.path.getmtime(WATCHLIST_PATH)
                if current_modified != last_modified:
                    last_modified = current_modified
                    latest_data = market_data.get_watchlist()
                    await websocket.send_json(latest_data)
                    logger.debug("Sent updated watchlist data via WebSocket")
            await asyncio.sleep(1)  # Check every second
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        await websocket.close()
        logger.debug("WebSocket client disconnected")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)




# import logging
# from fastapi import FastAPI, HTTPException, Request, WebSocket
# from fastapi.middleware.cors import CORSMiddleware
# import json
# import os
# import asyncio
# import sqlite3
# import uvicorn
# import sys
# from contextlib import asynccontextmanager
# from dotenv import load_dotenv
# # from backend.MarketDataConnection import MarketDataConnection
# from Websocket_Client import start_websocket
# from MarketDataConnection import MarketDataConnection

# load_dotenv()
# BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# DB_PATH = os.path.join(BASE_DIR, "backend", "algogene_app.db")
# WATCHLIST_PATH = os.path.join(BASE_DIR, "watchlist_data.json")

# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     logging.basicConfig(
#         level=logging.DEBUG,
#         filename='/Users/jinghann/Desktop/Algogene_App/app.log',
#         format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
#         handlers=[
#             logging.FileHandler(os.path.join(BASE_DIR, "app.log")),
#             logging.StreamHandler(sys.stdout)  # Output to terminal
#         ]
#     )
#     logger = logging.getLogger(__name__)
#     logger.debug("Starting lifespan event")
#     start_websocket()

#     conn = sqlite3.connect('/Users/jinghann/Desktop/Algogene_App/backend/algogene_app.db')
#     cursor = conn.cursor()
#     cursor.execute('''CREATE TABLE IF NOT EXISTS subaccounts
#                      (id TEXT PRIMARY KEY, broker TEXT, algorithm TEXT, currency TEXT, leverage TEXT, subscriptionEnd TEXT, 
#                       algo_id TEXT, availableBalance REAL, cashBalance REAL, realizedPL REAL, unrealizedPL REAL, 
#                       marginUsed REAL, status TEXT, brokerConnected INTEGER, brokerApiKey TEXT, brokerSecret TEXT)''')
#     conn.commit()
#     logger.debug("Table subaccounts created or already exists")
#     conn.close()
#     yield
#     logger.debug("Shutting down lifespan event")

# app = FastAPI(lifespan=lifespan)

# # Enable CORS to allow React Native frontend to access the API
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:19006", "http://localhost", "*"],  # Update with your frontend URL in production
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Initialize MarketDataConnection
# market_data = MarketDataConnection()

# # @app.get("/watchlist")
# # async def get_watchlist():
# #     latest_data = {"BTCUSD": {}}
# #     try:
# #         if os.path.exists("watchlist_data.json"):
# #             with open("watchlist_data.json", "r") as f:
# #                 lines = f.readlines()
# #                 for line in reversed(lines):
# #                     entry = json.loads(line.strip())
# #                     symbol = entry["symbol"]
# #                     if symbol == "BTCUSD" and not latest_data[symbol]:
# #                         latest_data[symbol] = {
# #                             "name": "BTC / USD",
# #                             "symbol": symbol,
# #                             "price": f"{entry['price']:.2f}",
# #                             "change": f"{'+' if entry['change_percent'] >= 0 else ''}{entry['change_percent']:.2f}%"
# #                         }
# #                         break
# #     except Exception as e:
# #         print(f"Error reading watchlist data: {e}")
# #     return [data for data in latest_data.values() if data]
# @app.get("/watchlist")
# async def get_watchlist():
#     latest_data = {"BTCUSD": {}}
#     try:
#         if os.path.exists("/Users/jinghann/Desktop/Algogene_App/watchlist_data.json"):
#             with open("/Users/jinghann/Desktop/Algogene_App/watchlist_data.json", "r") as f:
#                 lines = f.readlines()
#                 for line in reversed(lines):
#                     entry = json.loads(line.strip())
#                     symbol = entry["symbol"]
#                     if symbol == "BTCUSD" and not latest_data[symbol]:
#                         latest_data[symbol] = {
#                             "name": "BTC / USD",
#                             "symbol": symbol,
#                             "price": f"{entry['price']:.2f}",
#                             "change": f"{'+' if entry['change_percent'] >= 0 else ''}{entry['change_percent']:.2f}%"
#                         }
#                         break
#     except Exception as e:
#         logging.error(f"Error reading watchlist data: {e}")
#     return [data for data in latest_data.values() if data]

# # @app.post("/rest/v1/app_subaccounts")
# # async def save_subaccounts(request: Request):
# #     logging.basicConfig(level=logging.DEBUG)
# #     logger = logging.getLogger(__name__)
# #     logger.debug("Received request data: %s", await request.json())
# #     data = await request.json()
# #     session_id = data.get("sid")
# #     user = data.get("user")
# #     api_key = data.get("api_key")
# #     subaccounts = data.get("subAccounts")
# #     logger.debug("Parsed data: sid=%s, user=%s, api_key=%s, subaccounts=%s", session_id, user, api_key, subaccounts)
# #     try:
# #         conn = sqlite3.connect('algogene_app.db')
# #         cursor = conn.cursor()
# #         prepared_data = [
# #             (
# #                 sub.get("id", ""),
# #                 sub.get("broker", ""),
# #                 sub.get("algorithm", ""),
# #                 sub.get("currency", ""),
# #                 sub.get("leverage", ""),
# #                 sub.get("subscriptionEnd", ""),
# #                 sub.get("algo_id", ""),
# #                 float(sub.get("availableBalance", 0)),
# #                 float(sub.get("cashBalance", 0)),
# #                 float(sub.get("realizedPL", 0)),
# #                 float(sub.get("unrealizedPL", 0)),
# #                 float(sub.get("marginUsed", 0)),
# #                 sub.get("status", ""),
# #                 int(sub.get("brokerConnected", 0)),
# #                 sub.get("brokerApiKey", ""),
# #                 sub.get("brokerSecret", "")
# #             ) for sub in subaccounts
# #         ]
# #         cursor.executemany("INSERT OR REPLACE INTO subaccounts (id, broker, algorithm, currency, leverage, subscriptionEnd, algoId, availableBalance, cashBalance, realizedPL, unrealizedPL, marginUsed, status, brokerConnected, brokerApiKey, brokerSecret) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", prepared_data)
# #         conn.commit()
# #     except Exception as e:
# #         logger.error("Database error: %s", str(e))
# #         raise
# #     finally:
# #         conn.close()
# #     return {"status": True}

# @app.post("/rest/v1/app_subaccounts")
# async def save_subaccounts(request: Request):
#     logger = logging.getLogger(__name__)
#     try:
#         data = await request.json()
#         logger.debug("Received request data: %s", data)
#         session_id = data.get("sid")
#         user = data.get("user")
#         api_key = data.get("api_key")
#         subaccounts = data.get("subAccounts")
#         logger.debug("Parsed data: sid=%s, user=%s, api_key=%s, subaccounts=%s", session_id, user, api_key, subaccounts)

#         if not subaccounts or not isinstance(subaccounts, list):
#             logger.error("Invalid or missing subAccounts data")
#             raise HTTPException(status_code=400, detail="subAccounts must be a non-empty list")

#         conn = sqlite3.connect('/Users/jinghann/Desktop/Algogene_App/backend/algogene_app.db')
#         cursor = conn.cursor()
#         prepared_data = [
#             (
#                 sub.get("id", ""),
#                 sub.get("broker", ""),
#                 sub.get("algorithm", ""),
#                 sub.get("currency", ""),
#                 sub.get("leverage", ""),
#                 sub.get("subscriptionEnd", ""),
#                 sub.get("algoId", ""),
#                 float(sub.get("availableBalance", 0)),
#                 float(sub.get("cashBalance", 0)),
#                 float(sub.get("realizedPL", 0)),
#                 float(sub.get("unrealizedPL", 0)),
#                 float(sub.get("marginUsed", 0)),
#                 sub.get("status", ""),
#                 int(sub.get("brokerConnected", 0)),
#                 sub.get("brokerApiKey", ""),
#                 sub.get("brokerSecret", "")
#             ) for sub in subaccounts
#         ]
#         cursor.executemany(
#             "INSERT OR REPLACE INTO subaccounts (id, broker, algorithm, currency, leverage, subscriptionEnd, algoId, availableBalance, cashBalance, realizedPL, unrealizedPL, marginUsed, status, brokerConnected, brokerApiKey, brokerSecret) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
#             prepared_data
#         )
#         conn.commit()
#         logger.debug("Subaccounts saved successfully")
#         return {"status": True}
#     except ValueError as e:
#         logger.error("Invalid JSON data: %s", str(e))
#         raise HTTPException(status_code=400, detail="Invalid JSON data")
#     except sqlite3.Error as e:
#         logger.error("Database error: %s", str(e))
#         raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
#     except Exception as e:
#         logger.error("Unexpected error: %s", str(e))
#         raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
#     finally:
#         if 'conn' in locals():
#             conn.close()


# @app.websocket("/ws/watchlist")
# async def websocket_watchlist(websocket: WebSocket):
#     await websocket.accept()
#     logger = logging.getLogger(__name__)
#     logger.debug("WebSocket client connected")
#     try:
#         # Send initial watchlist data
#         initial_data = market_data.get_watchlist()
#         await websocket.send_json(initial_data)
        
#         # Watch for file changes
#         last_modified = 0
#         while True:
#             if os.path.exists("/Users/jinghann/Desktop/Algogene_App/watchlist_data.json"):
#                 current_modified = os.path.getmtime("/Users/jinghann/Desktop/Algogene_App/watchlist_data.json")
#                 if current_modified != last_modified:
#                     last_modified = current_modified
#                     latest_data = market_data.get_watchlist()
#                     await websocket.send_json(latest_data)
#                     logger.debug("Sent updated watchlist data via WebSocket")
#             await asyncio.sleep(1)  # Check every second
#     except Exception as e:
#         logger.error(f"WebSocket error: {e}")
#     finally:
#         await websocket.close()
#         logger.debug("WebSocket client disconnected")

# if __name__ == "__main__":
#     uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
