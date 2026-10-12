import os
from contextlib import asynccontextmanager
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from recommender.engine import RecommendationEngine

load_dotenv()

# Initialize Recommendation Engine
engine = RecommendationEngine(
    content_weight=float(os.getenv('CONTENT_WEIGHT', 0.40)),
    collab_weight=float(os.getenv('COLLAB_WEIGHT', 0.40)),
    behavior_weight=float(os.getenv('BEHAVIOR_WEIGHT', 0.20))
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Try to load existing model artifact or train on start
    print("[FastAPI] Starting IntelliCart AI Recommendation Service...")
    loaded = engine.load_artifacts()
    if not loaded:
        print("[FastAPI] No saved artifacts found. Attempting initial training...")
        try:
            engine.train()
        except Exception as e:
            print(f"[FastAPI] Initial train skipped or backend not yet ready: {e}")
    yield
    print("[FastAPI] Shutting down Recommendation Service...")

app = FastAPI(
    title="IntelliCart AI Recommendation Service",
    description="Microservice powering Content-Based, Collaborative, and Hybrid Product Recommendations",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for local backend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TrainRequest(BaseModel):
    products: Optional[List[Dict[str, Any]]] = None
    interactions: Optional[List[Dict[str, Any]]] = None

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "IntelliCart AI Recommendation Engine",
        "is_trained": engine.is_trained,
        "product_count": len(engine.products_df) if not engine.products_df.empty else 0,
        "interaction_count": len(engine.interactions_df) if not engine.interactions_df.empty else 0,
        "weights": {
            "content": engine.content_weight,
            "collaborative": engine.collab_weight,
            "behavior": engine.behavior_weight,
        }
    }

@app.get("/recommendations/user/{user_id}")
def get_user_recommendations(user_id: str, limit: int = Query(8, ge=1, le=50)):
    """
    Returns personalized hybrid recommendations for a user.
    Falls back gracefully to trending/popular products if user is new or engine is cold.
    """
    try:
        recommendations = engine.get_recommendations_for_user(user_id=user_id, limit=limit)
        return {
            "success": True,
            "userId": user_id,
            "count": len(recommendations),
            "recommendations": recommendations,
        }
    except Exception as e:
        print(f"[API Error] User recommendations failed: {e}")
        # Graceful fallback to cold-start trending items
        fallback = engine.get_cold_start_recommendations(limit=limit)
        return {
            "success": True,
            "userId": user_id,
            "fallback": True,
            "count": len(fallback),
            "recommendations": fallback,
        }

@app.get("/recommendations/product/{product_id}")
def get_product_recommendations(product_id: str, limit: int = Query(6, ge=1, le=30)):
    """
    Returns similar products based on TF-IDF cosine similarity of product features.
    """
    try:
        recommendations = engine.get_similar_products(product_id=product_id, limit=limit)
        return {
            "success": True,
            "productId": product_id,
            "count": len(recommendations),
            "recommendations": recommendations,
        }
    except Exception as e:
        print(f"[API Error] Product similarity failed: {e}")
        return {
            "success": False,
            "message": str(e),
            "recommendations": [],
        }

@app.post("/recommendations/train")
def train_model(payload: Optional[TrainRequest] = None, background_tasks: BackgroundTasks = None):
    """
    Triggers recommendation model training synchronously or using provided payload.
    """
    import pandas as pd
    try:
        if payload and payload.products and payload.interactions:
            p_df = pd.DataFrame(payload.products)
            i_df = pd.DataFrame(payload.interactions)
            success = engine.train(products_df=p_df, interactions_df=i_df)
        else:
            success = engine.train()

        return {
            "success": success,
            "message": "Model training completed successfully" if success else "Training failed or data unavailable",
            "is_trained": engine.is_trained,
            "products_loaded": len(engine.products_df),
            "interactions_loaded": len(engine.interactions_df),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training error: {str(e)}")

@app.post("/recommendations/rebuild")
def rebuild_model():
    """
    Forces a complete rebuild and cache refreshment of recommendation matrices.
    """
    try:
        success = engine.train()
        return {
            "success": success,
            "message": "Rebuilt model and cached similarity matrices",
            "is_trained": engine.is_trained,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Rebuild failed: {str(e)}")

# --- Dataset-based Collaborative Filtering Endpoints ---
dataset_recommender_instance = None

def get_dataset_recommender():
    global dataset_recommender_instance
    if dataset_recommender_instance is None:
        from recommender.dataset_collaborative import DatasetCollaborativeRecommender
        dataset_recommender_instance = DatasetCollaborativeRecommender()
        if not dataset_recommender_instance.load_artifacts():
            dataset_recommender_instance.train_and_evaluate()
    return dataset_recommender_instance

@app.get("/recommendations/dataset/user/{user_id}")
def get_dataset_user_recommendations(user_id: str, limit: int = Query(10, ge=1, le=50)):
    """
    Returns collaborative filtering recommendations for a user based on ratings_small.csv.
    """
    try:
        rec = get_dataset_recommender()
        recommendations = rec.recommend_for_user(user_id=user_id, top_n=limit)
        return {
            "success": True,
            "source": "ratings_small.csv",
            "userId": user_id,
            "count": len(recommendations),
            "recommendations": recommendations,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dataset recommendation error: {str(e)}")

@app.get("/recommendations/dataset/similar/{product_id}")
def get_dataset_similar_products(product_id: str, limit: int = Query(6, ge=1, le=30)):
    """
    Returns item-item collaborative similarity recommendations for an item based on ratings_small.csv.
    """
    try:
        rec = get_dataset_recommender()
        recommendations = rec.get_similar_products(product_id=product_id, top_n=limit)
        return {
            "success": True,
            "source": "ratings_small.csv",
            "productId": product_id,
            "count": len(recommendations),
            "recommendations": recommendations,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dataset similarity error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
