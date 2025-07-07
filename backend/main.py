from fastapi import FastAPI
import json
import os
from fastapi.middleware.cors import CORSMiddleware
from .MarketDataConnection import MarketDataConnection

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)