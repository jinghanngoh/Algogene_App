import logging
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import json
import os
import sqlite3
from contextlib import asynccontextmanager
from backend.MarketDataConnection import MarketDataConnection

@asynccontextmanager
async def lifespan(app: FastAPI):
    logging.basicConfig(
        level=logging.DEBUG,
        filename='/Users/jinghann/Desktop/Algogene_App/app.log',
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    logger = logging.getLogger(__name__)
    logger.debug("Starting lifespan event")
    conn = sqlite3.connect('/Users/jinghann/Desktop/Algogene_App/backend/algogene_app.db')
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS subaccounts
                     (id TEXT PRIMARY KEY, broker TEXT, algorithm TEXT, currency TEXT, leverage TEXT, subscriptionEnd TEXT, 
                      algo_id TEXT, availableBalance REAL, cashBalance REAL, realizedPL REAL, unrealizedPL REAL, 
                      marginUsed REAL, status TEXT, brokerConnected INTEGER, brokerApiKey TEXT, brokerSecret TEXT)''')
    conn.commit()
    logger.debug("Table subaccounts created or already exists")
    conn.close()
    yield
    logger.debug("Shutting down lifespan event")

app = FastAPI(lifespan=lifespan)

# Enable CORS to allow React Native frontend to access the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:19006", "http://localhost", "*"],  # Update with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize MarketDataConnection
market_data = MarketDataConnection()

# @app.get("/watchlist")
# async def get_watchlist():
#     latest_data = {"BTCUSD": {}}
#     try:
#         if os.path.exists("watchlist_data.json"):
#             with open("watchlist_data.json", "r") as f:
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
#         print(f"Error reading watchlist data: {e}")
#     return [data for data in latest_data.values() if data]
@app.get("/watchlist")
async def get_watchlist():
    latest_data = {"BTCUSD": {}}
    try:
        if os.path.exists("/Users/jinghann/Desktop/Algogene_App/watchlist_data.json"):
            with open("/Users/jinghann/Desktop/Algogene_App/watchlist_data.json", "r") as f:
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
        logging.error(f"Error reading watchlist data: {e}")
    return [data for data in latest_data.values() if data]

# @app.post("/rest/v1/app_subaccounts")
# async def save_subaccounts(request: Request):
#     logging.basicConfig(level=logging.DEBUG)
#     logger = logging.getLogger(__name__)
#     logger.debug("Received request data: %s", await request.json())
#     data = await request.json()
#     session_id = data.get("sid")
#     user = data.get("user")
#     api_key = data.get("api_key")
#     subaccounts = data.get("subAccounts")
#     logger.debug("Parsed data: sid=%s, user=%s, api_key=%s, subaccounts=%s", session_id, user, api_key, subaccounts)
#     try:
#         conn = sqlite3.connect('algogene_app.db')
#         cursor = conn.cursor()
#         prepared_data = [
#             (
#                 sub.get("id", ""),
#                 sub.get("broker", ""),
#                 sub.get("algorithm", ""),
#                 sub.get("currency", ""),
#                 sub.get("leverage", ""),
#                 sub.get("subscriptionEnd", ""),
#                 sub.get("algo_id", ""),
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
#         cursor.executemany("INSERT OR REPLACE INTO subaccounts (id, broker, algorithm, currency, leverage, subscriptionEnd, algoId, availableBalance, cashBalance, realizedPL, unrealizedPL, marginUsed, status, brokerConnected, brokerApiKey, brokerSecret) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", prepared_data)
#         conn.commit()
#     except Exception as e:
#         logger.error("Database error: %s", str(e))
#         raise
#     finally:
#         conn.close()
#     return {"status": True}

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

        conn = sqlite3.connect('/Users/jinghann/Desktop/Algogene_App/backend/algogene_app.db')
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