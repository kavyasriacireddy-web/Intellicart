import os
import requests
import pandas as pd

class DataLoader:
    def __init__(self, backend_url=None):
        self.backend_url = backend_url or os.getenv('BACKEND_URL', 'http://127.0.0.1:5000/api')

    def fetch_data(self):
        """
        Fetches products and user interactions from Node.js backend export endpoint.
        """
        url = f"{self.backend_url}/interactions/export"
        try:
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                data = response.json()
                products = data.get('products', [])
                interactions = data.get('interactions', [])
                print(f"[DataLoader] Successfully loaded {len(products)} products and {len(interactions)} interactions from backend.")
                return pd.DataFrame(products), pd.DataFrame(interactions)
            else:
                print(f"[DataLoader] Backend returned status code {response.status_code}")
                return pd.DataFrame(), pd.DataFrame()
        except Exception as e:
            print(f"[DataLoader] Warning: Could not connect to backend at {url}: {e}")
            return pd.DataFrame(), pd.DataFrame()
