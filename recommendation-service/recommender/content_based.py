import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class ContentBasedRecommender:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            stop_words='english',
            ngram_range=(1, 2),
            max_features=5000,
            token_pattern=r'(?u)\b\w+\b'
        )
        self.similarity_matrix = None
        self.product_indices = {}
        self.index_to_id = {}
        self.products_df = pd.DataFrame()

    def _create_feature_soup(self, row):
        """
        Combines product attributes into a rich weighted text document.
        """
        name = str(row.get('name', ''))
        category = str(row.get('categoryName', ''))
        subcategory = str(row.get('subcategory', ''))
        brand = str(row.get('brand', ''))
        description = str(row.get('description', ''))
        
        tags = row.get('tags', [])
        if isinstance(tags, list):
            tags_str = ' '.join(tags)
        else:
            tags_str = str(tags) if pd.notna(tags) else ''

        specs = row.get('specifications', {})
        specs_str = ''
        if isinstance(specs, dict):
            specs_str = ' '.join([f"{k} {v}" for k, v in specs.items()])

        # Weighting important semantic tokens by repeating key fields
        soup = f"{name} {name} {category} {category} {subcategory} {brand} {brand} {tags_str} {tags_str} {description} {specs_str}"
        return soup.lower().strip()

    def train(self, products_df: pd.DataFrame):
        """
        Fits TF-IDF vectorizer and calculates pairwise cosine similarity matrix.
        """
        if products_df.empty:
            print("[ContentRecommender] Error: products_df is empty. Cannot train.")
            return False

        self.products_df = products_df.copy()
        
        # Ensure _id is clean string
        if '_id' in self.products_df.columns:
            self.products_df['_id'] = self.products_df['_id'].astype(str)
        else:
            print("[ContentRecommender] Error: products_df lacks '_id' column.")
            return False

        # Reset indexing
        self.products_df.reset_index(drop=True, inplace=True)
        self.product_indices = {pid: idx for idx, pid in enumerate(self.products_df['_id'])}
        self.index_to_id = {idx: pid for idx, pid in enumerate(self.products_df['_id'])}

        # Build feature text representation
        soup_series = self.products_df.apply(self._create_feature_soup, axis=1)

        # Compute TF-IDF matrix
        tfidf_matrix = self.vectorizer.fit_transform(soup_series)
        
        # Compute Cosine Similarity Matrix
        self.similarity_matrix = cosine_similarity(tfidf_matrix, tfidf_matrix)
        print(f"[ContentRecommender] Fitted TF-IDF model on {len(self.products_df)} products. Matrix shape: {self.similarity_matrix.shape}")
        return True

    def get_similar_products(self, product_id: str, top_n: int = 6):
        """
        Returns top N most similar products for a given product_id.
        """
        product_id = str(product_id)
        if product_id not in self.product_indices or self.similarity_matrix is None:
            return []

        idx = self.product_indices[product_id]
        sim_scores = list(enumerate(self.similarity_matrix[idx]))

        # Sort based on similarity score (descending)
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)

        # Exclude the product itself (index 0)
        sim_scores = [s for s in sim_scores if s[0] != idx][:top_n]

        results = []
        for i, score in sim_scores:
            pid = self.index_to_id[i]
            product_row = self.products_df[self.products_df['_id'] == pid].iloc[0]
            results.append({
                'productId': pid,
                'name': product_row.get('name', ''),
                'categoryName': product_row.get('categoryName', ''),
                'brand': product_row.get('brand', ''),
                'score': float(score),
                'reason': f"Similar to {self.products_df.iloc[idx].get('name', 'viewed item')}",
            })
        return results

    def get_user_content_scores(self, user_interactions: pd.DataFrame):
        """
        Computes aggregated content similarity profile for a user based on their interacted products.
        """
        if self.similarity_matrix is None or user_interactions.empty:
            return {}

        product_scores = np.zeros(len(self.products_df))
        total_weight = 0

        for _, row in user_interactions.iterrows():
            pid = str(row.get('productId', ''))
            weight = float(row.get('weight', 1.0))
            if pid in self.product_indices:
                idx = self.product_indices[pid]
                product_scores += self.similarity_matrix[idx] * weight
                total_weight += weight

        if total_weight > 0:
            product_scores /= total_weight

        # Return dict mapping product_id -> score
        return {self.index_to_id[i]: float(product_scores[i]) for i in range(len(product_scores))}
