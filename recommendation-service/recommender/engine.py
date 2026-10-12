import os
import pickle
import numpy as np
import pandas as pd
from .content_based import ContentBasedRecommender
from .collaborative import CollaborativeRecommender
from .data_loader import DataLoader

class RecommendationEngine:
    def __init__(self, content_weight=0.40, collab_weight=0.40, behavior_weight=0.20):
        self.content_weight = content_weight
        self.collab_weight = collab_weight
        self.behavior_weight = behavior_weight

        self.content_recommender = ContentBasedRecommender()
        self.collab_recommender = CollaborativeRecommender()
        self.data_loader = DataLoader()

        self.products_df = pd.DataFrame()
        self.interactions_df = pd.DataFrame()
        self.is_trained = False

        self.model_dir = os.path.join(os.path.dirname(__file__), '..', 'models')
        os.makedirs(self.model_dir, exist_ok=True)
        self.artifact_path = os.path.join(self.model_dir, 'recommender_state.pkl')

    def train(self, products_df: pd.DataFrame = None, interactions_df: pd.DataFrame = None):
        """
        Trains both content-based and collaborative models, updating in-memory state and persisting to disk.
        """
        if products_df is None or interactions_df is None or products_df.empty:
            print("[Engine] Fetching fresh data from backend...")
            p_df, i_df = self.data_loader.fetch_data()
            if not p_df.empty:
                self.products_df = p_df
                self.interactions_df = i_df
            else:
                print("[Engine] Warning: Could not fetch data from backend.")
        else:
            self.products_df = products_df
            self.interactions_df = interactions_df

        if self.products_df.empty:
            print("[Engine] Cannot train: products dataset is empty.")
            return False

        # Train sub-recommenders
        cb_success = self.content_recommender.train(self.products_df)
        cf_success = self.collab_recommender.train(self.interactions_df, self.products_df)

        self.is_trained = cb_success

        # Persist model snapshot
        self.save_artifacts()
        print(f"[Engine] Training completed. Model trained: {self.is_trained}")
        return self.is_trained

    def save_artifacts(self):
        try:
            with open(self.artifact_path, 'wb') as f:
                pickle.dump({
                    'products_df': self.products_df,
                    'interactions_df': self.interactions_df,
                    'content_recommender': self.content_recommender,
                    'collab_recommender': self.collab_recommender,
                    'is_trained': self.is_trained
                }, f)
            print(f"[Engine] Model artifacts successfully saved to {self.artifact_path}")
        except Exception as e:
            print(f"[Engine] Error saving artifacts: {e}")

    def load_artifacts(self):
        if os.path.exists(self.artifact_path):
            try:
                with open(self.artifact_path, 'rb') as f:
                    state = pickle.load(f)
                    self.products_df = state.get('products_df', pd.DataFrame())
                    self.interactions_df = state.get('interactions_df', pd.DataFrame())
                    self.content_recommender = state.get('content_recommender', self.content_recommender)
                    self.collab_recommender = state.get('collab_recommender', self.collab_recommender)
                    self.is_trained = state.get('is_trained', False)
                print(f"[Engine] Loaded artifacts from disk. Ready: {self.is_trained}")
                return True
            except Exception as e:
                print(f"[Engine] Failed to load artifacts: {e}")
        return False

    def _normalize(self, score_dict):
        """Min-max normalizes scores to [0, 1] range."""
        if not score_dict:
            return {}
        vals = list(score_dict.values())
        min_v = min(vals)
        max_v = max(vals)
        if max_v == min_v:
            return {k: 0.5 for k in score_dict}
        return {k: (v - min_v) / (max_v - min_v) for k, v in score_dict.items()}

    def get_cold_start_recommendations(self, limit: int = 8, category_hint: str = None):
        """
        Returns top popular and highest-rated items for new users or cold-start fallback.
        """
        if self.products_df.empty:
            return []

        df = self.products_df.copy()
        
        # Exclude out of stock
        if 'stock' in df.columns:
            df = df[df['stock'] > 0]

        if category_hint and 'categoryName' in df.columns:
            cat_matches = df[df['categoryName'].str.lower() == category_hint.lower()]
            if len(cat_matches) >= 4:
                df = cat_matches

        # Sort by rating and reviews
        sort_cols = []
        if 'rating' in df.columns:
            sort_cols.append('rating')
        if 'numReviews' in df.columns:
            sort_cols.append('numReviews')

        if sort_cols:
            df = df.sort_values(by=sort_cols, ascending=False)

        top_slice = df.head(limit)
        results = []
        for _, row in top_slice.iterrows():
            results.append({
                'productId': str(row['_id']),
                'name': row.get('name', ''),
                'categoryName': row.get('categoryName', ''),
                'brand': row.get('brand', ''),
                'finalPrice': float(row.get('finalPrice', row.get('price', 0))),
                'price': float(row.get('price', 0)),
                'rating': float(row.get('rating', 0)),
                'images': row.get('images', []),
                'score': 0.85,
                'reason': 'Trending & Popular on IntelliCart',
            })
        return results

    def get_similar_products(self, product_id: str, limit: int = 6):
        """
        Returns content-based similar items for a specific product.
        """
        if not self.is_trained:
            self.load_artifacts()
            if not self.is_trained:
                self.train()

        similar_items = self.content_recommender.get_similar_products(product_id, top_n=limit)
        
        # Enrich with product details
        results = []
        for item in similar_items:
            pid = item['productId']
            p_rows = self.products_df[self.products_df['_id'].astype(str) == pid]
            if not p_rows.empty:
                p = p_rows.iloc[0]
                results.append({
                    'productId': pid,
                    'name': p.get('name', ''),
                    'categoryName': p.get('categoryName', ''),
                    'brand': p.get('brand', ''),
                    'finalPrice': float(p.get('finalPrice', p.get('price', 0))),
                    'price': float(p.get('price', 0)),
                    'rating': float(p.get('rating', 0)),
                    'images': p.get('images', []),
                    'score': item['score'],
                    'reason': item['reason'],
                })
        return results

    def get_recommendations_for_user(self, user_id: str, limit: int = 8):
        """
        Produces personalized hybrid recommendations for a user.
        Formula:
          finalScore = 0.40 * Content + 0.40 * Collaborative + 0.20 * Behavioral Affinity
        """
        user_id = str(user_id)
        if not self.is_trained:
            self.load_artifacts()
            if not self.is_trained:
                self.train()

        # Check user interactions
        user_interactions = pd.DataFrame()
        if not self.interactions_df.empty:
            user_interactions = self.interactions_df[self.interactions_df['userId'].astype(str) == user_id]

        # COLD START CHECK: Less than 2 interactions => return trending/popular
        if user_interactions.empty or len(user_interactions) < 2:
            return self.get_cold_start_recommendations(limit=limit)

        # 1. Content-based scores
        content_scores = self.content_recommender.get_user_content_scores(user_interactions)
        norm_content = self._normalize(content_scores)

        # 2. Collaborative scores
        collab_scores = self.collab_recommender.get_collaborative_scores_for_user(user_id)
        norm_collab = self._normalize(collab_scores)

        # 3. Direct behavioral affinity (categories user has browsed or purchased)
        category_counts = {}
        purchased_product_ids = set()

        for _, row in user_interactions.iterrows():
            pid = str(row.get('productId', ''))
            action = str(row.get('action', ''))
            if action == 'PURCHASE':
                purchased_product_ids.add(pid)

            # Extract category hints
            p_rows = self.products_df[self.products_df['_id'].astype(str) == pid]
            if not p_rows.empty:
                cat = p_rows.iloc[0].get('categoryName')
                if cat:
                    category_counts[cat] = category_counts.get(cat, 0) + float(row.get('weight', 1))

        # Hybrid Score Combination
        all_candidate_ids = [str(pid) for pid in self.products_df['_id']]
        hybrid_scores = []

        top_fav_category = max(category_counts, key=category_counts.get) if category_counts else None

        for pid in all_candidate_ids:
            # Exclude already purchased products
            if pid in purchased_product_ids:
                continue

            p_rows = self.products_df[self.products_df['_id'].astype(str) == pid]
            if p_rows.empty:
                continue
            product = p_rows.iloc[0]

            # Exclude out of stock
            if product.get('stock', 1) <= 0:
                continue

            c_score = norm_content.get(pid, 0.0)
            cf_score = norm_collab.get(pid, 0.0)

            # Behavior score based on category match
            p_cat = product.get('categoryName', '')
            b_score = 1.0 if (top_fav_category and p_cat == top_fav_category) else 0.2

            final_score = (
                self.content_weight * c_score +
                self.collab_weight * cf_score +
                self.behavior_weight * b_score
            )

            # Generate dynamic explanation rationale
            if cf_score > 0.6 and cf_score >= c_score:
                reason = "Popular among users with similar shopping interests"
            elif c_score > 0.5:
                reason = f"Based on your interest in {p_cat}"
            elif top_fav_category and p_cat == top_fav_category:
                reason = f"Recommended in your preferred category ({top_fav_category})"
            else:
                reason = "Personalized discovery based on your shopping profile"

            hybrid_scores.append({
                'productId': pid,
                'name': product.get('name', ''),
                'categoryName': p_cat,
                'brand': product.get('brand', ''),
                'finalPrice': float(product.get('finalPrice', product.get('price', 0))),
                'price': float(product.get('price', 0)),
                'rating': float(product.get('rating', 0)),
                'images': product.get('images', []),
                'score': round(float(final_score), 4),
                'reason': reason,
            })

        # Sort descending by hybrid score
        hybrid_scores = sorted(hybrid_scores, key=lambda x: x['score'], reverse=True)

        if not hybrid_scores:
            return self.get_cold_start_recommendations(limit=limit)

        return hybrid_scores[:limit]
