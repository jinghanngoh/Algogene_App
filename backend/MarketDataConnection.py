import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
WATCHLIST_PATH = os.path.join(BASE_DIR, "watchlist_data.json")

class MarketDataConnection:
    def __init__(self):
        pass

    def get_watchlist(self):
        latest_data = {"BTCUSD": {}, "ETHUSD": {}}
        try:
            if os.path.exists(WATCHLIST_PATH) and os.path.getsize(WATCHLIST_PATH) > 0:
                with open(WATCHLIST_PATH, "r") as f:
                    lines = f.readlines()
                    symbol_entries = {}
                    for line in reversed(lines):
                        try:
                            entry = json.loads(line.strip())
                            symbol = entry["symbol"]
                            if symbol in latest_data and symbol not in symbol_entries:
                                symbol_entries[symbol] = {
                                    "name": f"{symbol[:3]} / USD",
                                    "symbol": symbol,
                                    "price": f"{entry['price']:.2f}",
                                    "change": f"{'+' if entry['change_percent'] >= 0 else ''}{entry['change_percent']:.2f}%",
                                    "icon": f"https://example.com/icons/{symbol.lower()}.png"
                                }
                        except json.JSONDecodeError as e:
                            print(f"Invalid JSON line in {WATCHLIST_PATH}: {e}")
                            continue
                    latest_data.update(symbol_entries)
            else:
                print(f"{WATCHLIST_PATH} is empty or does not exist")
        except Exception as e:
            print(f"Error reading watchlist data: {e}")
        return [data for data in latest_data.values() if data]

if __name__ == "__main__":
    mdc = MarketDataConnection()
    print(mdc.get_watchlist())