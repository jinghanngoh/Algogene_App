# import websocket
# import json
# import logging
# import time
# import threading
# import signal
# import sys
# import os
# from dotenv import load_dotenv
# from datetime import datetime

# load_dotenv()
# BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# WATCHLIST_PATH = os.path.join(BASE_DIR, "watchlist_data.json")

# # Set up logging
# logging.basicConfig(
#     level=logging.INFO,
#     format="%(asctime)s - %(levelname)s - %(message)s",
#     handlers=[
#         logging.FileHandler(os.path.join(BASE_DIR, "websocket.log")),
#         logging.StreamHandler(sys.stdout)  # Output to terminal
#     ]
# )

# # Global flag to control reconnection and ping thread
# running = True

# # Dictionary to store the previous price for each symbol
# watchlist_data = {
#     "BTCUSD": {"previous_price": None, "current_price": None, "change_percent": None}
# }

# def signal_handler(sig, frame):
#     """Handle Ctrl+C to exit gracefully."""
#     global running
#     logging.info("Received Ctrl+C, shutting down...")
#     running = False
#     sys.exit(0)

# def on_message(ws, message):
#     """Handle incoming WebSocket messages."""
#     if not running:
#         return
#     try:
#         data = json.loads(message)
#         logging.info(f"Received: {data}")
        
#         if data.get("msg_id") == 0:
#             # Respond to server ping with client pong
#             ws.send(json.dumps({"msg_id": 0, "status": True, "msg": "client pong"}))
#             logging.info("Sent client pong to ALGOGENE")
#         else:
#             # Process market data
#             symbol = data.get("symbol")
#             bid_price = float(data.get("bidPrice", 0))
#             ask_price = float(data.get("askPrice", 0))
#             if symbol in watchlist_data and bid_price and ask_price:
#                 # Calculate mid price
#                 current_price = (bid_price + ask_price) / 2
#                 # Update watchlist data
#                 watchlist_data[symbol]["previous_price"] = watchlist_data[symbol]["current_price"]
#                 watchlist_data[symbol]["current_price"] = current_price
#                 # Calculate percentage change
#                 if watchlist_data[symbol]["previous_price"] is not None:
#                     previous_price = watchlist_data[symbol]["previous_price"]
#                     watchlist_data[symbol]["change_percent"] = (
#                         (current_price - previous_price) / previous_price * 100
#                     ) if previous_price != 0 else 0
#                 logging.info(
#                     f"Watchlist update: {symbol} - Price: {current_price:.2f}, "
#                     f"Change: {watchlist_data[symbol]['change_percent']:.2f}%"
#                 )
#                 # Save to JSON Lines file
#                 with open("watchlist_data.json", "a") as f:
#                     f.write(
#                         json.dumps(
#                             {
#                                 "timestamp": data.get("timestamp", datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")),
#                                 "symbol": symbol,
#                                 "price": current_price,
#                                 "change_percent": watchlist_data[symbol]["change_percent"],
#                                 "broker": data.get("broker", "Unknown")
#                             }
#                         ) + "\n"
#                     )
#     except json.JSONDecodeError as e:
#         logging.error(f"Failed to parse message as JSON: {e}, Raw message: {message}")

# def on_error(ws, error):
#     """Handle WebSocket errors."""
#     if not running:
#         return
#     logging.error(f"WebSocket error: {error}")

# def on_close(ws, close_status_code, close_msg):
#     """Handle WebSocket closure."""
#     if not running:
#         return
#     logging.info(f"WebSocket closed with code: {close_status_code}, message: {close_msg}")

# def on_open(ws):
#     """Handle WebSocket connection opening."""
#     if not running:
#         return
#     logging.info("Connected to ALGOGENE WebSocket")
#     # Send subscription message
#     msg = json.dumps({
#         "msg_id": 13,
#         "user": "demo2",
#         "api_key": "4WE4Qd010AqNZc9W701ZmR0U8I1d3mHl",
#         "symbols": ["BTCUSD"],
#         "broker": ""
#     })
#     ws.send(msg)
#     logging.info("Sent subscription message")

#     # Start keep-alive pings
#     def send_ping():
#         while running:
#             try:
#                 time.sleep(25)  # Ping every 25 seconds
#                 if not running:
#                     break
#                 ws.send(json.dumps({"msg_id": 0, "status": True, "msg": "client ping"}))
#                 logging.info("Sent client ping to ALGOGENE")
#             except Exception as e:
#                 logging.error(f"Ping failed: {e}")
#                 break

#     threading.Thread(target=send_ping, daemon=True).start()

# def connect_websocket():
#     """Connect to ALGOGENE WebSocket with reconnection logic."""
#     global running
#     ws_url = "wss://algogene.com/ws"
#     while running:
#         try:
#             ws = websocket.WebSocketApp(
#                 ws_url,
#                 on_message=on_message,
#                 on_error=on_error,
#                 on_close=on_close,
#                 on_open=on_open
#             )
#             ws.run_forever()
#         except Exception as e:
#             if not running:
#                 break
#             logging.error(f"WebSocket connection failed: {e}")
#             logging.info("Reconnecting in 5 seconds...")
#             time.sleep(5)
#     logging.info("WebSocket client stopped.")

# def start_websocket():
#     """Start the WebSocket connection in a separate thread."""
#     threading.Thread(target=connect_websocket, daemon=True).start()

# if __name__ == "__main__":
#     signal.signal(signal.SIGINT, signal_handler)
#     start_websocket()

import websocket
import json
import logging
import time
import threading
import signal
import sys
import os
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
WATCHLIST_PATH = os.path.join(BASE_DIR, "watchlist_data.json")

# Set up logging to both file and console
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler(os.path.join(BASE_DIR, "websocket.log")),
        logging.StreamHandler(sys.stdout)
    ]
)

# Global flag to control reconnection and ping thread
running = True

# Dictionary to store the previous price for each symbol
watchlist_data = {
    "BTCUSD": {"previous_price": None, "current_price": None, "change_percent": None}
}

def signal_handler(sig, frame):
    """Handle Ctrl+C to exit gracefully."""
    global running
    logging.info("Received Ctrl+C, shutting down...")
    running = False
    sys.exit(0)

def on_message(ws, message):
    """Handle incoming WebSocket messages."""
    if not running:
        return
    try:
        data = json.loads(message)
        logging.debug(f"Received: {data}")
        
        if data.get("msg_id") == 0:
            # Respond to server ping with client pong
            ws.send(json.dumps({"msg_id": 0, "status": True, "msg": "client pong"}))
            logging.info("Sent client pong to ALGOGENE")
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
                logging.info(
                    f"Watchlist update: {symbol} - Price: {current_price:.2f}, "
                    f"Change: {watchlist_data[symbol]['change_percent']:.2f}%"
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
                                    "change_percent": watchlist_data[symbol]["change_percent"],
                                    "broker": data.get("broker", "Unknown")
                                }
                            ) + "\n"
                        )
                except PermissionError as e:
                    logging.error(f"Failed to write to {WATCHLIST_PATH}: {e}")
    except json.JSONDecodeError as e:
        logging.error(f"Failed to parse message as JSON: {e}, Raw message: {message}")
    except Exception as e:
        logging.error(f"Unexpected error in on_message: {e}")

def on_error(ws, error):
    """Handle WebSocket errors."""
    if not running:
        return
    logging.error(f"WebSocket error: {error}")

def on_close(ws, close_status_code, close_msg):
    """Handle WebSocket closure."""
    if not running:
        return
    logging.info(f"WebSocket closed with code: {close_status_code}, message: {close_msg}")

def on_open(ws):
    """Handle WebSocket connection opening."""
    if not running:
        return
    logging.info("Connected to ALGOGENE WebSocket")
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
        logging.info("Sent subscription message")
    except Exception as e:
        logging.error(f"Failed to send subscription message: {e}")

    # Start keep-alive pings
    def send_ping():
        while running:
            try:
                time.sleep(25)
                if not running:
                    break
                ws.send(json.dumps({"msg_id": 0, "status": True, "msg": "client ping"}))
                logging.info("Sent client ping to ALGOGENE")
            except Exception as e:
                logging.error(f"Ping failed: {e}")
                break

    threading.Thread(target=send_ping, daemon=True).start()

def connect_websocket():
    """Connect to ALGOGENE WebSocket with reconnection logic."""
    global running
    ws_url = "wss://algogene.com/ws"
    attempt = 1
    while running:
        try:
            logging.debug(f"Attempting WebSocket connection (attempt {attempt})")
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
            logging.error(f"WebSocket connection failed: {e}")
            wait_time = min(5 * attempt, 60)
            logging.info(f"Reconnecting in {wait_time} seconds...")
            time.sleep(wait_time)
            attempt += 1
        except KeyboardInterrupt:
            logging.info("KeyboardInterrupt received, stopping...")
            running = False
            break
    logging.info("WebSocket client stopped.")

def start_websocket():
    """Start the WebSocket connection in a separate thread."""
    logging.info("Starting WebSocket client thread")
    threading.Thread(target=connect_websocket, daemon=True).start()

if __name__ == "__main__":
    signal.signal(signal.SIGINT, signal_handler)
    logging.info("Starting Websocket_Client.py")
    try:
        start_websocket()
        # Keep the main thread alive to allow the daemon thread to run
        while running:
            time.sleep(1)
    except KeyboardInterrupt:
        logging.info("Main thread received KeyboardInterrupt, shutting down...")
        running = False

# import asyncio
# import websockets
# import json
# import random
# import logging
# from datetime import datetime

# # Set up logging
# logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
# logger = logging.getLogger(__name__)

# # Initial price
# btc_price = 63500.00
# connected_clients = set()

# async def handle_client(websocket, path):
#     """Handle a client connection"""
#     global connected_clients
    
#     # Add client to connected set
#     connected_clients.add(websocket)
#     client_id = id(websocket)
#     logger.info(f"Client {client_id} connected. Total clients: {len(connected_clients)}")
    
#     try:
#         # Handle client messages
#         async for message in websocket:
#             try:
#                 data = json.loads(message)
#                 logger.info(f"Received from client {client_id}: {data}")
                
#                 # Handle subscription requests
#                 if data.get("action") == "subscribe" and data.get("symbol"):
#                     logger.info(f"Client {client_id} subscribed to {data.get('symbol')}")
                    
#                 # Handle ping/pong
#                 if data.get("msg_id") == 0 and data.get("msg") == "client pong":
#                     logger.info(f"Received pong from client {client_id}")
#             except json.JSONDecodeError:
#                 logger.error(f"Invalid JSON from client {client_id}: {message}")
#     except websockets.exceptions.ConnectionClosed:
#         logger.info(f"Client {client_id} disconnected")
#     finally:
#         # Remove client when they disconnect
#         connected_clients.remove(websocket)
#         logger.info(f"Client {client_id} removed. Total clients: {len(connected_clients)}")

# async def send_price_updates():
#     """Send price updates to all connected clients"""
#     global btc_price, connected_clients
    
#     while True:
#         if connected_clients:
#             # Update price with random movement
#             change = random.uniform(-200, 200)
#             btc_price += change
#             btc_price = max(btc_price, 10000)  # Ensure price doesn't go too low
            
#             # Calculate percentage change
#             percent_change = (change / btc_price) * 100
            
#             # Create message
#             timestamp = datetime.now().isoformat()
#             message = {
#                 "timestamp": timestamp,
#                 "symbol": "BTCUSD",
#                 "price": btc_price,
#                 "change_percent": percent_change
#             }
            
#             # Send to all connected clients
#             for client in connected_clients:
#                 try:
#                     await client.send(json.dumps(message))
#                 except websockets.exceptions.ConnectionClosed:
#                     # Client already disconnected
#                     pass
            
#             logger.info(f"Sent price update: BTC ${btc_price:.2f} ({percent_change:.2f}%)")
        
#         # Send ping message every 30 seconds
#         if len(connected_clients) > 0 and (datetime.now().second % 30) == 0:
#             ping_message = {
#                 "msg_id": 0,
#                 "action": "ping",
#                 "msg": "server ping"
#             }
#             for client in connected_clients:
#                 try:
#                     await client.send(json.dumps(ping_message))
#                     logger.info(f"Sent ping to {id(client)}")
#                 except websockets.exceptions.ConnectionClosed:
#                     # Client already disconnected
#                     pass
        
#         # Wait before next update
#         await asyncio.sleep(1)

# async def main():
#     """Start the WebSocket server and price update loop"""
#     # Start the WebSocket server
#     server = await websockets.serve(handle_client, "localhost", 8765)
#     logger.info("WebSocket server started at ws://localhost:8765")
    
#     # Start the price update task
#     price_task = asyncio.create_task(send_price_updates())
    
#     # Keep the server running
#     await server.wait_closed()

# if __name__ == "__main__":
#     asyncio.run(main())