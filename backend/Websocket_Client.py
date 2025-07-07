import websocket
import json
import logging
import time
import threading
import signal
import sys
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

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
        logging.info(f"Received: {data}")
        
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
                with open("watchlist_data.json", "a") as f:
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
    except json.JSONDecodeError as e:
        logging.error(f"Failed to parse message as JSON: {e}, Raw message: {message}")

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
    msg = json.dumps({
        "msg_id": 13,
        "user": "demo2",
        "api_key": "4WE4Qd010AqNZc9W701ZmR0U8I1d3mHl",
        "symbols": ["BTCUSD"],
        "broker": ""
    })
    ws.send(msg)
    logging.info("Sent subscription message")

    # Start keep-alive pings
    def send_ping():
        while running:
            try:
                time.sleep(25)  # Ping every 25 seconds
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
    while running:
        try:
            ws = websocket.WebSocketApp(
                ws_url,
                on_message=on_message,
                on_error=on_error,
                on_close=on_close,
                on_open=on_open
            )
            ws.run_forever()
        except Exception as e:
            if not running:
                break
            logging.error(f"WebSocket connection failed: {e}")
            logging.info("Reconnecting in 5 seconds...")
            time.sleep(5)
    logging.info("WebSocket client stopped.")

def start_websocket():
    """Start the WebSocket connection in a separate thread."""
    threading.Thread(target=connect_websocket, daemon=True).start()