import unittest
import pandas as pd
from recommender.engine import RecommendationEngine

class TestRecommendationEngine(unittest.TestCase):
    def setUp(self):
        # Synthetic mock dataset reflecting the real catalog
        self.products = [
            {
                '_id': 'p1',
                'name': 'Apple MacBook Pro 14 M3',
                'categoryName': 'Electronics',
                'subcategory': 'Laptops',
                'brand': 'Apple',
                'price': 1999.0,
                'finalPrice': 1899.05,
                'stock': 15,
                'rating': 4.9,
                'numReviews': 25,
                'tags': ['laptop', 'apple', 'developer', 'macbook'],
                'description': 'M3 chip performance with Liquid Retina display for coding and video.',
            },
            {
                '_id': 'p2',
                'name': 'Logitech MX Master 3S Mouse',
                'categoryName': 'Electronics',
                'subcategory': 'Accessories',
                'brand': 'Logitech',
                'price': 99.99,
                'finalPrice': 89.99,
                'stock': 30,
                'rating': 4.8,
                'numReviews': 40,
                'tags': ['mouse', 'wireless', 'accessories', 'developer'],
                'description': 'Ergonomic precision mouse with MagSpeed scrolling for laptop workstations.',
            },
            {
                '_id': 'p3',
                'name': 'Sony WH-1000XM5 Noise Canceling Headphones',
                'categoryName': 'Electronics',
                'subcategory': 'Audio',
                'brand': 'Sony',
                'price': 399.99,
                'finalPrice': 349.99,
                'stock': 20,
                'rating': 4.9,
                'numReviews': 50,
                'tags': ['audio', 'headphones', 'sony', 'wireless'],
                'description': 'Industry leading active noise cancellation headphones for focused work.',
            },
            {
                '_id': 'p4',
                'name': 'Nike Air Max 270 React Sneakers',
                'categoryName': 'Fashion',
                'subcategory': 'Footwear',
                'brand': 'Nike',
                'price': 159.99,
                'finalPrice': 143.99,
                'stock': 25,
                'rating': 4.7,
                'numReviews': 35,
                'tags': ['shoes', 'sneakers', 'nike', 'running'],
                'description': 'Cushioned athletic sneakers for everyday lifestyle comfort.',
            },
            {
                '_id': 'p5',
                'name': 'Fossil Grant Leather Watch',
                'categoryName': 'Fashion',
                'subcategory': 'Watches',
                'brand': 'Fossil',
                'price': 140.0,
                'finalPrice': 112.0,
                'stock': 18,
                'rating': 4.6,
                'numReviews': 20,
                'tags': ['watch', 'leather', 'accessories', 'luxury'],
                'description': 'Vintage inspired Roman numeral chronograph watch with genuine leather.',
            },
        ]

        self.interactions = [
            # User Tech (user_tech) loves Electronics
            {'userId': 'user_tech', 'productId': 'p1', 'action': 'PURCHASE', 'weight': 5},
            {'userId': 'user_tech', 'productId': 'p2', 'action': 'ADD_TO_CART', 'weight': 4},
            {'userId': 'user_tech', 'productId': 'p3', 'action': 'PRODUCT_VIEW', 'weight': 1},

            # User Fashion (user_fashion) loves Fashion
            {'userId': 'user_fashion', 'productId': 'p4', 'action': 'PURCHASE', 'weight': 5},
            {'userId': 'user_fashion', 'productId': 'p5', 'action': 'WISHLIST', 'weight': 3},

            # Peer Tech (user_peer) bought both MacBook and Sony Headphones
            {'userId': 'user_peer', 'productId': 'p1', 'action': 'PURCHASE', 'weight': 5},
            {'userId': 'user_peer', 'productId': 'p3', 'action': 'PURCHASE', 'weight': 5},
        ]

        self.products_df = pd.DataFrame(self.products)
        self.interactions_df = pd.DataFrame(self.interactions)

        self.engine = RecommendationEngine(content_weight=0.40, collab_weight=0.40, behavior_weight=0.20)
        self.engine.train(products_df=self.products_df, interactions_df=self.interactions_df)

    def test_model_training_status(self):
        self.assertTrue(self.engine.is_trained)
        self.assertEqual(len(self.engine.products_df), 5)

    def test_content_based_similarity(self):
        # Querying similar products to MacBook Pro (p1)
        sim_p1 = self.engine.get_similar_products('p1', limit=2)
        self.assertTrue(len(sim_p1) > 0)
        # Should recommend MX Master Mouse or Sony Headphones (Electronics category / developer tags)
        rec_ids = [item['productId'] for item in sim_p1]
        self.assertIn('p2', rec_ids)

    def test_user_personalized_recommendation(self):
        # User Tech already bought p1 (MacBook Pro), so p1 must be excluded
        recs = self.engine.get_recommendations_for_user('user_tech', limit=3)
        rec_ids = [item['productId'] for item in recs]

        # Already purchased product p1 must NOT be in recommendations
        self.assertNotIn('p1', rec_ids)
        # High likelihood that p3 (Sony Headphones) or p2 is recommended
        self.assertTrue('p2' in rec_ids or 'p3' in rec_ids)

    def test_cold_start_fallback(self):
        # Brand new user with zero interaction telemetry
        cold_recs = self.engine.get_recommendations_for_user('brand_new_visitor_123', limit=2)
        self.assertEqual(len(cold_recs), 2)
        # Must return top rated products
        self.assertTrue(cold_recs[0]['rating'] >= 4.5)

if __name__ == '__main__':
    unittest.main()
