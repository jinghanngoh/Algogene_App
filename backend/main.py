from fastapi import FastAPI, Request
import json
import os
import sqlite3
from fastapi.middleware.cors import CORSMiddleware
from .MarketData_Connection import MarketDataConnection

app = FastAPI()

# Enable CORS to allow React Native frontend to access the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize MarketDataConnection
market_data = MarketDataConnection()

@app.get("/watchlist")
async def get_watchlist():
    latest_data = {"BTCUSD": {}}
    try:
        if os.path.exists("watchlist_data.json"):
            with open("watchlist_data.json", "r") as f:
                # Read the last line for BTCUSD
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
        print(f"Error reading watchlist data: {e}")
    return [data for data in latest_data.values() if data]

@app.get("/rest/v1/app_subaccounts")
async def get_subaccounts(request: Request):
    session_id = request.query_params.get("sid")
    user = request.query_params.get("user")
    api_key = request.query_params.get("api_key")
    # Validate session_id, user, api_key (add your validation logic here)
    conn = sqlite3.connect('algogene_app.db')
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM subaccounts WHERE user = ?", (user,))
    subaccounts = cursor.fetchall()
    conn.close()
    return {"status": True, "data": subaccounts}

@app.post("/rest/v1/app_subaccounts")
async def save_subaccounts(request: Request):
    data = await request.json()
    session_id = data.get("sid")
    user = data.get("user")
    api_key = data.get("api_key")
    subaccounts = data.get("subAccounts")
    # Validate session_id, user, api_key (add your validation logic here)
    conn = sqlite3.connect('algogene_app.db')
    cursor = conn.cursor()
    cursor.executemany("INSERT OR REPLACE INTO subaccounts (id, broker, algorithm, currency, leverage, subscriptionEnd, runningScript, availableBalance, cashBalance, realizedPL, unrealizedPL, marginUsed, status, brokerConnected, brokerApiKey, brokerSecret) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", subaccounts)
    conn.commit()
    conn.close()
    return {"status": True}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)