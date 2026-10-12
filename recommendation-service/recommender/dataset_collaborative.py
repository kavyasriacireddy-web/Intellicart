import os
import pickle
import numpy as np
import pandas as pd
from scipy.sparse import csr_matrix
from sklearn.model_selection import train_test_split


class DatasetCollaborativeRecommender:
    """
    Item-Item Collaborative Filtering Recommender trained on ratings_small.csv
    using memory-efficient scipy.sparse matrices.
    """

    def __init__(self, dataset_path=None):
        if dataset_path is None:
            # Default to ../Dataset/ratings_small.csv relative to this file
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            self.dataset_path = os.path.join(base_dir, 'Dataset', 'ratings_small.csv')
        else:
            self.dataset_path = dataset_path

        self.df = None
        self.user_to_idx = {}
        self.idx_to_user = {}
        self.item_to_idx = {}
        self.idx_to_item = {}

        self.user_item_matrix = None  # csr_matrix
        self.item_similarity_matrix = None  # csr_matrix or ndarray
        self.item_means = {}
        self.global_mean = 0.0
        self.is_trained = False

        self.model_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'models')
        os.makedirs(self.model_dir, exist_ok=True)
        self.artifact_path = os.path.join(self.model_dir, 'collaborative_dataset_state.pkl')

    def load_data(self, path=None):
        """
        Loads the 50,000 ratings dataset using the defined 4 columns.
        """
        file_path = path or self.dataset_path
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Ratings dataset not found at {file_path}")

        df = pd.read_csv(
            file_path,
            names=['userId', 'productId', 'rating', 'timestamp'],
            header=0,  # ratings_small.csv has header created
            dtype={'userId': str, 'productId': str, 'rating': float, 'timestamp': int}
        )
        self.df = df.dropna().copy()
        self.df['userId'] = self.df['userId'].astype(str)
        self.df['productId'] = self.df['productId'].astype(str)
        return self.df

    def _build_sparse_matrices(self, df):
        """
        Constructs user-item mappings and sparse matrices efficiently.
        """
        unique_users = sorted(df['userId'].unique())
        unique_items = sorted(df['productId'].unique())

        user_to_idx = {u: i for i, u in enumerate(unique_users)}
        idx_to_user = {i: u for i, u in enumerate(unique_users)}
        item_to_idx = {p: i for i, p in enumerate(unique_items)}
        idx_to_item = {i: p for i, p in enumerate(unique_items)}

        user_rows = df['userId'].map(user_to_idx).values
        item_cols = df['productId'].map(item_to_idx).values
        ratings = df['rating'].values

        n_users = len(unique_users)
        n_items = len(unique_items)

        matrix = csr_matrix((ratings, (user_rows, item_cols)), shape=(n_users, n_items), dtype=np.float32)

        return matrix, user_to_idx, idx_to_user, item_to_idx, idx_to_item

    def _compute_item_similarity(self, user_item_matrix):
        """
        Computes Item-Item Cosine Similarity using normalized sparse item vectors.
        """
        # Transpose: shape becomes (n_items, n_users)
        item_user = user_item_matrix.T.tocsr()

        # Compute Euclidean norm of each item vector
        sq_sum = item_user.power(2).sum(axis=1)
        norms = np.sqrt(np.array(sq_sum).flatten())
        norms[norms == 0] = 1.0  # avoid division by zero

        # Scale sparse rows: multiply each row by 1 / norm
        from scipy.sparse import diags
        inv_norms = diags(1.0 / norms)
        item_user_normalized = inv_norms.dot(item_user)

        # Pairwise cosine similarity between items
        sim_matrix = item_user_normalized.dot(item_user_normalized.T).toarray()
        np.fill_diagonal(sim_matrix, 0.0)  # zero out self-similarity
        return sim_matrix

    def train_and_evaluate(self, test_size=0.2, random_state=42):
        """
        Trains and evaluates the model using an 80/20 train/test split.
        Reports RMSE and MAE, then refits on full dataset.
        """
        if self.df is None or self.df.empty:
            self.load_data()

        train_df, test_df = train_test_split(self.df, test_size=test_size, random_state=random_state)

        # Train on 80% split
        train_matrix, train_u2i, _, train_i2i, _ = self._build_sparse_matrices(train_df)
        train_sim = self._compute_item_similarity(train_matrix)

        global_mean = float(train_df['rating'].mean())
        item_means = train_df.groupby('productId')['rating'].mean().to_dict()
        user_means = train_df.groupby('userId')['rating'].mean().to_dict()

        # Evaluate on 20% test split
        actuals = []
        predictions = []

        # Convert train matrix to CSR for fast indexing
        train_csr = train_matrix.tocsr()

        for _, row in test_df.iterrows():
            u = row['userId']
            i = row['productId']
            actual = float(row['rating'])
            actuals.append(actual)

            pred = None
            if u in train_u2i and i in train_i2i:
                u_idx = train_u2i[u]
                i_idx = train_i2i[i]

                # Ratings given by user u
                user_ratings = train_csr.getrow(u_idx).toarray().flatten()
                rated_item_indices = np.where(user_ratings > 0)[0]

                if len(rated_item_indices) > 0:
                    sims = train_sim[i_idx, rated_item_indices]
                    user_rats = user_ratings[rated_item_indices]

                    sim_sum = np.sum(np.abs(sims))
                    if sim_sum > 0:
                        pred = np.sum(sims * user_rats) / sim_sum

            if pred is None:
                # Fallback hierarchy: item mean -> user mean -> global mean
                pred = item_means.get(i, user_means.get(u, global_mean))

            # Bound prediction to realistic rating range [1.0, 5.0]
            pred = max(1.0, min(5.0, float(pred)))
            predictions.append(pred)

        actuals = np.array(actuals)
        predictions = np.array(predictions)

        rmse = float(np.sqrt(np.mean((actuals - predictions) ** 2)))
        mae = float(np.mean(np.abs(actuals - predictions)))

        # Refit model on the 100% full dataset for maximum accuracy during inference
        print(f"[DatasetCollaborative] Fitting model on full dataset ({len(self.df)} records)...")
        full_matrix, u2i, i2u, i2i, i2p = self._build_sparse_matrices(self.df)
        full_sim = self._compute_item_similarity(full_matrix)

        self.user_item_matrix = full_matrix
        self.user_to_idx = u2i
        self.idx_to_user = i2u
        self.item_to_idx = i2i
        self.idx_to_item = i2p
        self.item_similarity_matrix = full_sim
        self.item_means = self.df.groupby('productId')['rating'].mean().to_dict()
        self.global_mean = float(self.df['rating'].mean())
        self.is_trained = True

        self.save_artifacts()

        return {
            'train_size': len(train_df),
            'test_size': len(test_df),
            'unique_users': len(self.user_to_idx),
            'unique_items': len(self.item_to_idx),
            'rmse': rmse,
            'mae': mae
        }

    def recommend_for_user(self, user_id: str, top_n: int = 10):
        """
        Generates Top-N recommendations for a specified user in ratings_small.csv.
        """
        if not self.is_trained:
            if not self.load_artifacts():
                self.train_and_evaluate()

        user_id = str(user_id)
        if user_id not in self.user_to_idx:
            # Cold-start fallback: Top items by mean rating with at least 5 ratings
            top_popular = (
                self.df.groupby('productId')
                .agg(mean_rating=('rating', 'mean'), count=('rating', 'count'))
                .query('count >= 3')
                .sort_values(by=['mean_rating', 'count'], ascending=False)
                .head(top_n)
            )
            return [
                {
                    'productId': pid,
                    'predicted_score': round(float(row['mean_rating']), 3),
                    'reason': f"Top rated product in Electronics ({int(row['count'])} ratings)"
                }
                for pid, row in top_popular.iterrows()
            ]

        u_idx = self.user_to_idx[user_id]
        user_ratings = self.user_item_matrix.getrow(u_idx).toarray().flatten()
        rated_indices = set(np.where(user_ratings > 0)[0])

        # Predicted ratings for unrated items
        candidate_scores = []
        for i_idx, pid in self.idx_to_item.items():
            if i_idx in rated_indices:
                continue

            sims = self.item_similarity_matrix[i_idx, list(rated_indices)]
            sim_sum = np.sum(np.abs(sims))

            if sim_sum > 0:
                score = float(np.sum(sims * user_ratings[list(rated_indices)]) / sim_sum)
            else:
                score = float(self.item_means.get(pid, self.global_mean))

            score = max(1.0, min(5.0, score))
            candidate_scores.append((pid, score))

        candidate_scores.sort(key=lambda x: x[1], reverse=True)
        top_candidates = candidate_scores[:top_n]

        return [
            {
                'productId': pid,
                'predicted_score': round(score, 3),
                'reason': 'Collaborative affinity based on similar user co-ratings'
            }
            for pid, score in top_candidates
        ]

    def get_similar_products(self, product_id: str, top_n: int = 6):
        """
        Returns top similar products to product_id based on Item-Item cosine similarity.
        """
        if not self.is_trained:
            if not self.load_artifacts():
                self.train_and_evaluate()

        product_id = str(product_id)
        if product_id not in self.item_to_idx:
            return []

        i_idx = self.item_to_idx[product_id]
        sim_scores = self.item_similarity_matrix[i_idx]

        # Top similar item indices excluding self
        top_indices = np.argsort(sim_scores)[::-1]
        results = []
        for idx in top_indices:
            if idx == i_idx or sim_scores[idx] <= 0:
                continue
            pid = self.idx_to_item[idx]
            results.append({
                'productId': pid,
                'similarity_score': round(float(sim_scores[idx]), 4),
                'reason': f'High co-rating similarity ({round(float(sim_scores[idx]), 3)}) with product {product_id}'
            })
            if len(results) >= top_n:
                break

        return results

    def save_artifacts(self, path=None):
        target = path or self.artifact_path
        try:
            with open(target, 'wb') as f:
                pickle.dump({
                    'user_item_matrix': self.user_item_matrix,
                    'user_to_idx': self.user_to_idx,
                    'idx_to_user': self.idx_to_user,
                    'item_to_idx': self.item_to_idx,
                    'idx_to_item': self.idx_to_item,
                    'item_similarity_matrix': self.item_similarity_matrix,
                    'item_means': self.item_means,
                    'global_mean': self.global_mean,
                    'is_trained': self.is_trained
                }, f)
            print(f"[DatasetCollaborative] Artifacts successfully saved to {target}")
            return True
        except Exception as e:
            print(f"[DatasetCollaborative] Error saving artifacts: {e}")
            return False

    def load_artifacts(self, path=None):
        target = path or self.artifact_path
        if os.path.exists(target):
            try:
                with open(target, 'rb') as f:
                    state = pickle.load(f)
                    self.user_item_matrix = state.get('user_item_matrix', None)
                    self.user_to_idx = state.get('user_to_idx', {})
                    self.idx_to_user = state.get('idx_to_user', {})
                    self.item_to_idx = state.get('item_to_idx', {})
                    self.idx_to_item = state.get('idx_to_item', {})
                    self.item_similarity_matrix = state.get('item_similarity_matrix', None)
                    self.item_means = state.get('item_means', {})
                    self.global_mean = state.get('global_mean', 0.0)
                    self.is_trained = state.get('is_trained', False)
                print(f"[DatasetCollaborative] Loaded artifacts from {target}")
                return True
            except Exception as e:
                print(f"[DatasetCollaborative] Failed to load artifacts: {e}")
        return False
