import os
import sys
import time

# Ensure recommender package is importable
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from recommender.dataset_collaborative import DatasetCollaborativeRecommender


def run_training_pipeline():
    print("=" * 65)
    print("[INTELLICART] DATASET COLLABORATIVE FILTERING PIPELINE")
    print("=" * 65)

    start_time = time.time()
    recommender = DatasetCollaborativeRecommender()

    print(f"\n[1/4] Loading ratings sample from:\n      {recommender.dataset_path}")
    df = recommender.load_data()
    print(f"      Loaded {len(df):,} valid rows across {df['userId'].nunique():,} users and {df['productId'].nunique():,} products.")

    print("\n[2/4] Training & Evaluating with 80/20 Train/Test Split...")
    metrics = recommender.train_and_evaluate(test_size=0.2, random_state=42)

    print("\n" + "-" * 65)
    print("EVALUATION METRICS (80/20 SPLIT):")
    print(f"   * Train Interactions:  {metrics['train_size']:,}")
    print(f"   * Test Interactions:   {metrics['test_size']:,}")
    print(f"   * Unique Users:        {metrics['unique_users']:,}")
    print(f"   * Unique Products:     {metrics['unique_items']:,}")
    print(f"   * RMSE (Root MSE):     {metrics['rmse']:.4f}")
    print(f"   * MAE (Mean Abs Err):  {metrics['mae']:.4f}")
    print("-" * 65)

    print("\n[3/4] Testing Model Inference...")
    # Select a frequent user from dataset to test recommendations
    user_counts = df['userId'].value_counts()
    sample_user = str(user_counts.index[0])
    print(f"   * Generating Top-5 Recommendations for User '{sample_user}' (Rated {user_counts.iloc[0]} items):")
    recommendations = recommender.recommend_for_user(sample_user, top_n=5)
    for idx, rec in enumerate(recommendations, 1):
        print(f"     {idx}. Product: {rec['productId']} | Score: {rec['predicted_score']} | Reason: {rec['reason']}")

    # Select a frequent product from dataset to test item similarity
    item_counts = df['productId'].value_counts()
    sample_item = str(item_counts.index[0])
    print(f"\n   * Finding Top-3 Similar Products for Item '{sample_item}' (Has {item_counts.iloc[0]} ratings):")
    similar_items = recommender.get_similar_products(sample_item, top_n=3)
    for idx, sim in enumerate(similar_items, 1):
        print(f"     {idx}. Item: {sim['productId']} | Similarity: {sim['similarity_score']} | Reason: {sim['reason']}")

    print("\n[4/4] Verifying Artifact Persistence...")
    artifact_path = recommender.artifact_path
    if os.path.exists(artifact_path):
        size_mb = os.path.getsize(artifact_path) / (1024 * 1024)
        print(f"   [OK] Artifact successfully verified at: {artifact_path} ({size_mb:.2f} MB)")
    else:
        print(f"   [FAIL] Artifact not found at {artifact_path}")

    elapsed = time.time() - start_time
    print(f"\nPipeline completed successfully in {elapsed:.2f} seconds!")
    print("=" * 65 + "\n")


if __name__ == '__main__':
    run_training_pipeline()
