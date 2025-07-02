import asyncio
import json
import logging
import websockets
from fastapi import WebSocket

# Set up logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

class MarketDataConnection:
    def __init__(self):
        self.ws_url = "wss://algogene.com/ws"
        self.subscription_msg = {
            "msg_id": 13,
            "user": "demo2",
            "api_key": "4WE4Qd010AqNZc9W701ZmR0U8I1d3mHl",
            "symbols": ["ETHUSD", "BTCUSD"],  # Updated to include both symbols
            "broker": ""
        }
        self.connected_clients = set()

    async def connect(self):
        """Connect to ALGOGENE WebSocket and handle messages."""
        while True:
            try:
                async with websockets.connect(self.ws_url) as ws:
                    # Send subscription message
                    await ws.send(json.dumps(self.subscription_msg))
                    logging.info("Subscribed to ALGOGENE WebSocket")

                    # Start keep-alive pings
                    async def keep_alive():
                        while True:
                            await asyncio.sleep(25)
                            try:
                                await ws.send(json.dumps({"msg_id": 0, "status": True, "msg": "client ping"}))
                                logging.info("Sent client ping to ALGOGENE")
                            except Exception as e:
                                logging.error(f"Keep-alive ping failed: {e}")
                                break

                    asyncio.create_task(keep_alive())

                    # Receive and broadcast messages
                    async for message in ws:
                        logging.info(f"Received from ALGOGENE: {message}")
                        try:
                            data = json.loads(message)
                            if data.get("msg_id") == 0:
                                # Respond to server ping
                                await ws.send(json.dumps({"msg_id": 0, "status": True, "msg": "client pong"}))
                                logging.info("Sent client pong to ALGOGENE")
                            else:
                                # Broadcast market data to connected clients
                                for client in self.connected_clients:
                                    try:
                                        await client.send_text(message)
                                    except Exception as e:
                                        logging.error(f"Failed to send to client: {e}")
                                        self.connected_clients.discard(client)
                        except json.JSONDecodeError as e:
                            logging.error(f"Failed to parse ALGOGENE message as JSON: {e}, Raw message: {message}")
                            continue
            except Exception as e:
                logging.error(f"ALGOGENE WebSocket error: {e}")
                logging.info("Reconnecting to ALGOGENE in 5 seconds...")
                await asyncio.sleep(5)

    async def add_client(self, websocket: WebSocket):
        """Add a client to receive market data."""
        await websocket.accept()
        self.connected_clients.add(websocket)
        logging.info("Client connected to FASTAPI WebSocket")
        try:
            while True:
                await websocket.receive_text()
        except Exception as e:
            logging.error(f"Client WebSocket error: {e}")
        finally:
            self.connected_clients.discard(websocket)
            logging.info("Client disconnected from FASTAPI WebSocket")

    def start(self):
        """Start the ALGOGENE WebSocket connection in the background."""
        asyncio.create_task(self.connect())


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


