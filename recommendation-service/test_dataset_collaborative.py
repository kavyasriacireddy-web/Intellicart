import os
import sys
import unittest

current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from recommender.dataset_collaborative import DatasetCollaborativeRecommender


class TestDatasetCollaborativeRecommender(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.recommender = DatasetCollaborativeRecommender()
        cls.df = cls.recommender.load_data()
        cls.metrics = cls.recommender.train_and_evaluate(test_size=0.2, random_state=42)

    def test_data_loading(self):
        """Verifies dataset loads with exact 4 columns and expected row count."""
        self.assertIsNotNone(self.df)
        self.assertEqual(len(self.df), 50000)
        self.assertListEqual(list(self.df.columns), ['userId', 'productId', 'rating', 'timestamp'])
        self.assertFalse(self.df.isnull().values.any())

    def test_matrix_construction(self):
        """Verifies sparse user-item matrix creation and mappings."""
        sample_df = self.df.head(100)
        matrix, u2i, i2u, i2i, i2p = self.recommender._build_sparse_matrices(sample_df)
        self.assertEqual(matrix.shape[0], len(u2i))
        self.assertEqual(matrix.shape[1], len(i2i))
        self.assertGreater(matrix.nnz, 0)

    def test_model_training_and_evaluation(self):
        """Verifies 80/20 train/test split returns valid RMSE and MAE."""
        metrics = self.metrics
        self.assertIn('rmse', metrics)
        self.assertIn('mae', metrics)
        self.assertGreater(metrics['rmse'], 0.0)
        self.assertGreater(metrics['mae'], 0.0)
        # Ratings are 1-5, so error should be reasonable (typically ~1.0-1.5)
        self.assertLess(metrics['rmse'], 3.0)
        self.assertLess(metrics['mae'], 3.0)
        self.assertTrue(self.recommender.is_trained)

    def test_recommendations_for_user(self):
        """Verifies top-N recommendation generation for a known user."""
        sample_user = self.df['userId'].iloc[0]
        recs = self.recommender.recommend_for_user(sample_user, top_n=5)
        self.assertIsInstance(recs, list)
        self.assertGreater(len(recs), 0)
        for r in recs:
            self.assertIn('productId', r)
            self.assertIn('predicted_score', r)
            self.assertIn('reason', r)
            self.assertGreaterEqual(r['predicted_score'], 1.0)
            self.assertLessEqual(r['predicted_score'], 5.0)

    def test_similar_products(self):
        """Verifies item-item similarity lookup."""
        # Find a product with multiple ratings
        top_prod = self.df['productId'].value_counts().index[0]
        similar = self.recommender.get_similar_products(top_prod, top_n=3)
        self.assertIsInstance(similar, list)
        for s in similar:
            self.assertIn('productId', s)
            self.assertIn('similarity_score', s)
            self.assertGreaterEqual(s['similarity_score'], 0.0)
            self.assertLessEqual(s['similarity_score'], 1.0)

    def test_artifact_save_and_load(self):
        """Verifies saving and loading of model state."""
        self.assertTrue(self.recommender.save_artifacts())
        new_recommender = DatasetCollaborativeRecommender()
        self.assertTrue(new_recommender.load_artifacts())
        self.assertTrue(new_recommender.is_trained)
        self.assertEqual(len(new_recommender.item_to_idx), len(self.recommender.item_to_idx))


if __name__ == '__main__':
    unittest.main()
