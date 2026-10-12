import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity

class CollaborativeRecommender:
    def __init__(self):
        self.user_item_matrix = None
        self.item_similarity_matrix = None
        self.users = []
        self.products = []
        self.product_indices = {}
        self.user_indices = {}

    def train(self, interactions_df: pd.DataFrame, products_df: pd.DataFrame):
        """
        Builds the User-Item interaction matrix and computes item-to-item collaborative similarity.
        """
        if interactions_df.empty or products_df.empty:
            print("[CollaborativeRecommender] Warning: Empty interactions or products dataframe.")
            return False

        # Filter valid product interactions
        valid_df = interactions_df[interactions_df['productId'].notna() & (interactions_df['productId'] != '')].copy()
        valid_df['userId'] = valid_df['userId'].astype(str)
        valid_df['productId'] = valid_df['productId'].astype(str)

        # Aggregate weights per (user, product)
        grouped = valid_df.groupby(['userId', 'productId'])['weight'].sum().reset_index()

        # Build pivot matrix: Rows = Users, Columns = Products
        self.user_item_matrix = grouped.pivot(index='userId', columns='productId', values='weight').fillna(0)

        # Ensure all catalog products exist as columns
        all_product_ids = [str(pid) for pid in products_df['_id']]
        for pid in all_product_ids:
            if pid not in self.user_item_matrix.columns:
                self.user_item_matrix[pid] = 0.0

        self.user_item_matrix = self.user_item_matrix[all_product_ids]
        self.users = list(self.user_item_matrix.index)
        self.products = list(self.user_item_matrix.columns)
        self.user_indices = {uid: idx for idx, uid in enumerate(self.users)}
        self.product_indices = {pid: idx for idx, pid in enumerate(self.products)}

        # Item-Item similarity: Transpose so rows are items, columns are users
        item_matrix = self.user_item_matrix.T.values
        # Handle zero vectors safely
        norms = np.linalg.norm(item_matrix, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        normalized_items = item_matrix / norms

        self.item_similarity_matrix = np.dot(normalized_items, normalized_items.T)
        print(f"[CollaborativeRecommender] Computed collaborative similarity on {len(self.users)} users and {len(self.products)} products.")
        return True

    def get_collaborative_scores_for_user(self, user_id: str):
        """
        Predicts user affinity for all products using item-based collaborative filtering:
        score(user, item_j) = sum(similarity(item_j, item_i) * user_rating(item_i)) / sum(|similarity|)
        """
        user_id = str(user_id)
        if self.user_item_matrix is None or user_id not in self.user_indices:
            return {}

        user_vector = self.user_item_matrix.loc[user_id].values
        if np.sum(user_vector) == 0:
            return {}

        # Matrix multiplication of item similarities with user interaction vector
        scores = np.dot(self.item_similarity_matrix, user_vector)

        # Normalization denominator
        sim_sums = np.dot(np.abs(self.item_similarity_matrix), (user_vector > 0).astype(float))
        sim_sums[sim_sums == 0] = 1.0
        normalized_scores = scores / sim_sums

        return {self.products[i]: float(normalized_scores[i]) for i in range(len(self.products))}
