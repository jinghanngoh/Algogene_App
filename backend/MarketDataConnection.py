# backend/MarketData_Connection.py
import json
import os

class MarketDataConnection:
    def __init__(self):
        pass  # Add initialization logic if needed

    def get_watchlist(self):
        latest_data = {"BTCUSD": {}}
        try:
            if os.path.exists("watchlist_data.json"):
                with open("watchlist_data.json", "r") as f:
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