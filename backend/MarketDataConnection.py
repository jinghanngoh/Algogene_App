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
            "user": "demo2",  # Replace with your user ID
            "api_key": "4WE4Qd010AqNZc9W701ZmR0U8I1d3mHl",  # Replace with your API key
            "symbols": ["ETHUSD"],  # Free account: one symbol
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
                            await asyncio.sleep(25)  # Send before 30-second server heartbeat
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
                            continue  # Skip invalid messages
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
                # Keep the client connection alive (handle client messages if needed)
                await websocket.receive_text()
        except Exception as e:
            logging.error(f"Client WebSocket error: {e}")
        finally:
            self.connected_clients.discard(websocket)
            logging.info("Client disconnected from FASTAPI WebSocket")

    def start(self):
        """Start the ALGOGENE WebSocket connection in the background."""
        asyncio.create_task(self.connect())