import websocket
import json
import logging
import time
import threading
import signal
import sys

# Set up logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# Global flag to control reconnection and ping thread
running = True

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
    logging.info(f"Received: {message}")
    try:
        data = json.loads(message)
        if data.get("msg_id") == 0:
            # Respond to server ping with client pong
            ws.send(json.dumps({"msg_id": 0, "status": True, "msg": "client pong"}))
            logging.info("Sent client pong to ALGOGENE")
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
        "symbols": ["BTCUSD", "ETHUSD"],
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

if __name__ == "__main__":
    # Register signal handler for Ctrl+C
    signal.signal(signal.SIGINT, signal_handler)
    try:
        connect_websocket()
    except KeyboardInterrupt:
        logging.info("KeyboardInterrupt received, exiting...")
        running = False

# import asyncio
# import json
# import logging
# import requests
# from fastapi import FastAPI, WebSocket, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
# from typing import List, Dict, Optional
# from MarketDataConnection import MarketDataConnection
# from contextlib import asynccontextmanager
# import uuid

# # Set up logging
# logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# # Initialize MarketDataConnection
# market_data = MarketDataConnection()

# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     # Startup code
#     market_data.start()
#     yield
#     # Shutdown code
#     logging.info("Shutting down ALGOGENE WebSocket")

# app = FastAPI(lifespan=lifespan)

# # Allow CORS for React Native frontend
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # Update with your frontend URL in production
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # In-memory storage for user settings and sessions (use a database in production)
# user_settings: Dict[str, Dict] = {}  # { "user": { "watchlist": ["ETHUSD"], "email": "test@test.com", ... } }
# user_sessions: Dict[str, str] = {}  # { "user": "sid" }

# # Pydantic models for request validation
# class LoginRequest(BaseModel):
#     user: str
#     api_key: str
#     c_Email: str
#     c_Pwd: str

# class UserSettings(BaseModel):
#     watchlist: List[str]
#     email: Optional[str] = None

# # ALGOGENE REST API configuration
# BASE_URL = "https://algogene.com"
# API_KEY = "13c80d4bd1094d07ceb974baa684cf8ccdd18f4aea56a7c46cc91abf0cc883ff"  # Replace with your API key

# @app.post("/login")
# async def login(request: LoginRequest):
#     """Handle user login using ALGOGENE REST API."""
#     url = f"{BASE_URL}/rest/v1/app_userlogin"
#     sid = str(uuid.uuid4()).replace("-", "")
#     headers = {"Content-Type": "application/json"}
#     payload = {
#         "user": request.user,
#         "api_key": request.api_key,
#         "sid": sid,
#         "c_Email": request.c_Email,
#         "c_Pwd": request.c_Pwd
#     }
#     try:
#         response = requests.post(url, json=payload, headers=headers)
#         if response.status_code == 200:
#             data = response.json()
#             if data.get("status"):
#                 user_sessions[request.user] = sid
#                 user_settings[request.user] = {"watchlist": ["ETHUSD"], "email": request.c_Email}
#                 market_data.update_sid(sid)  # Update WebSocket with sid
#                 return {"status": True, "res": "Login successful", "sid": sid}
#             else:
#                 raise HTTPException(status_code=400, detail=data.get("res", "Login failed"))
#         else:
#             raise HTTPException(status_code=response.status_code, detail="ALGOGENE API error")
#     except requests.RequestException as e:
#         raise HTTPException(status_code=500, detail=f"Request failed: {str(e)}")

# @app.post("/logout")
# async def logout(user: str):
#     """Handle user logout using ALGOGENE REST API."""
#     sid = user_sessions.get(user)
#     if not sid:
#         raise HTTPException(status_code=400, detail="User not logged in")
#     url = f"{BASE_URL}/rest/v1/app_userlogout"
#     headers = {"Content-Type": "application/json"}
#     payload = {
#         "user": user,
#         "api_key": API_KEY,
#         "sid": sid,
#         "c_Email": user_settings.get(user, {}).get("email", "")
#     }
#     try:
#         response = requests.post(url, json=payload, headers=headers)
#         if response.status_code == 200:
#             data = response.json()
#             if data.get("status"):
#                 user_sessions.pop(user, None)
#                 user_settings.pop(user, None)
#                 market_data.update_sid("")  # Clear sid on logout
#                 return {"status": True, "res": "Logout successful"}
#             else:
#                 raise HTTPException(status_code=400, detail=data.get("res", "Logout failed"))
#         else:
#             raise HTTPException(status_code=response.status_code, detail="ALGOGENE API error")
#     except requests.RequestException as e:
#         raise HTTPException(status_code=500, detail=f"Request failed: {str(e)}")

# @app.get("/settings/{user}")
# async def get_settings(user: str):
#     """Retrieve user settings."""
#     if user not in user_settings:
#         raise HTTPException(status_code=404, detail="User not found")
#     return user_settings[user]

# @app.post("/settings/{user}")
# async def update_settings(user: str, settings: UserSettings):
#     """Update user settings."""
#     if user not in user_settings:
#         raise HTTPException(status_code=404, detail="User not found")
#     user_settings[user]["watchlist"] = settings.watchlist
#     user_settings[user]["email"] = settings.email or user_settings[user]["email"]
#     return {"status": True, "res": "Settings updated"}

# @app.get("/instruments")
# async def list_instruments(user: str):
#     """Query ALGOGENE /list_instrument endpoint."""
#     sid = user_sessions.get(user)
#     if not sid:
#         raise HTTPException(status_code=400, detail="User not logged in")
#     url = f"{BASE_URL}/rest/v1/list_instrument"
#     headers = {"Content-Type": "application/json"}
#     params = {"user": user, "api_key": API_KEY, "sid": sid}
#     try:
#         response = requests.get(url, params=params, headers=headers)
#         if response.status_code == 200:
#             return response.json()
#         else:
#             raise HTTPException(status_code=response.status_code, detail="ALGOGENE API error")
#     except requests.RequestException as e:
#         raise HTTPException(status_code=500, detail=f"Request failed: {str(e)}")

# @app.websocket("/ws/market-data")
# async def websocket_endpoint(websocket: WebSocket):
#     """WebSocket endpoint for market data."""
#     await market_data.add_client(websocket)

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000)


