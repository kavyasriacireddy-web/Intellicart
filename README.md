# IntelliCart: An E-Commerce Platform with AI-Powered Personalized Recommendations

> **Tagline:** *"Shop Smarter. Discover Better."*  
> **Academic Level:** B.Tech Computer Science & Engineering Major Project

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Community-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Python](https://img.shields.io/badge/Python-3.11%2B-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![scikit--learn](https://img.shields.io/badge/scikit--learn-1.5-F7931E?logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## 📌 Project Overview

**IntelliCart** is a complete, full-stack, distributed academic major project designed to solve e-commerce choice overload using applied artificial intelligence. Unlike basic static student demos, IntelliCart features real frontend-backend integration, MongoDB persistence, JWT authentication, persistent carts, verified review tracking, real-time behavioral interaction telemetry, and a dedicated Python FastAPI recommendation microservice.

---

## 🚀 Key Features

### 🛍️ E-Commerce Storefront
- **18 Responsive User Pages:** Home, Products, Product Details, Category Products, Search Results, Cart, Wishlist, Checkout, Order Confirmation, My Orders, Order Details, Recommendations Discovery Hub, User Profile, User Settings, Login, Register, Forgot Password, and 404 Page.
- **Faceted Product Search:** Keyword matching on title, brand, description, and tags with category filters, brand checkboxes, min/max price sliders, rating filters, stock toggles, and multi-option sorting.
- **Persistent Cart & Wishlist:** MongoDB-backed cart and wishlist that syncs across user sessions, prevents over-ordering beyond inventory limits, and calculates taxes and dynamic free shipping thresholds.
- **Verified Purchase Reviews:** Strict security logic ensures only verified buyers with confirmed orders can submit ratings (1-5 stars) and reviews, dynamically recalculating product averages.
- **Simulated Instant Checkout:** Supports Cash on Delivery (COD) and simulated instant online payments (Credit Card, UPI) with atomic stock decrements.

### 🧠 Core Innovation: AI Recommendation Engine
- **Content-Based Filtering:** TF-IDF Vectorizer with English stop words and N-gram range over product descriptions, categories, specifications, and tags to calculate pairwise Cosine Similarity.
- **Item-Item Collaborative Filtering:** Constructs a sparse User-Item interaction matrix from live behavioral telemetry (Views=1, Searches=2, Wishlist=3, Carts=4, Purchases=5) to compute item similarity vectors.
- **Hybrid Fusion Algorithm:**
  $$\text{FinalScore} = 0.40 \times \text{ContentScore} + 0.40 \times \text{CollaborativeScore} + 0.20 \times \text{BehavioralIntent}$$
- **Cold-Start Handling:** Intelligently serves trending and highest-rated products when a user has insufficient interaction history, transitioning seamlessly once behavioral telemetry is gathered.
- **Exclusion Filters:** Automatically suppresses already purchased products and out-of-stock items.
- **Explainable Recommendations:** Transparently tags recommendations with human-readable rationale (*"Because you viewed Electronics"*, *"Popular among shoppers like you"*, *"Trending in Fitness"*).

### 🛡️ Administrator Management Portal
- **Executive KPI Dashboard:** Real-time revenue metrics, total orders, pending shipments, customer accounts, and low-stock alerts.
- **Product Management:** Full CRUD interface for adding, editing, restocking, or removing catalog items.
- **Order Fulfillment:** Live status updater (`PENDING` $\to$ `CONFIRMED` $\to$ `PROCESSING` $\to$ `SHIPPED` $\to$ `DELIVERED` $\to$ `CANCELLED`).
- **Telemetry & AI Analytics:** Real-time log of customer actions, most viewed products, popular search queries, and 1-click model retraining trigger.

---

## 🏗️ System Architecture

```
IntelliCart/
├── frontend/                 # React 18 + Vite + Tailwind CSS SPA
│   ├── src/
│   │   ├── components/       # Navbar, Footer, ProductCard, Skeletons, Guards
│   │   ├── context/          # AuthContext, CartContext, WishlistContext, ToastContext
│   │   ├── pages/            # 18 User Pages + 6 Admin Management Pages
│   │   ├── services/         # Axios API Client with JWT injection
│   │   └── utils/            # Telemetry tracking utilities
│   ├── package.json
│   └── vite.config.js
├── backend/                  # Node.js + Express REST API Gateway
│   ├── src/
│   │   ├── config/           # MongoDB connection utility
│   │   ├── controllers/      # Auth, Products, Cart, Wishlist, Orders, Reviews, AI
│   │   ├── middleware/       # JWT auth guard, Admin authorization, Error handlers
│   │   ├── models/           # Mongoose schemas (8 models)
│   │   ├── routes/           # Modular REST route definitions
│   │   ├── seeds/            # Realistic 52+ product catalog seed script
│   │   └── services/         # Python AI microservice connector with circuit breaker
│   ├── tests/                # Automated API test suite
│   ├── package.json
│   └── .env.example
├── recommendation-service/   # Python 3 + FastAPI ML Microservice
│   ├── recommender/
│   │   ├── content_based.py  # TF-IDF & Cosine Similarity
│   │   ├── collaborative.py  # User-Item Interaction Matrix & Item Similarity
│   │   ├── engine.py         # Hybrid Fusion, Cold-Start, Normalization, & Cache
│   │   └── data_loader.py    # Live telemetry data ingest
│   ├── main.py               # FastAPI endpoints & lifecycle
│   ├── test_recommendation.py# Python recommendation unit tests
│   ├── requirements.txt
│   └── .env.example
├── docs/                     # Academic Documentation & Diagrams
│   ├── PROJECT_DOCUMENTATION.md # Comprehensive B.Tech Project Report
│   ├── DIAGRAMS.md           # UML diagrams (Architecture, Use Case, ERD, Sequence)
│   └── VIVA.md               # Viva Voce Questions & Answers
├── .gitignore
├── .env.example
└── README.md
```

---

## ⚙️ Environment Configuration

Copy `.env.example` in each service directory to `.env`:

### 1. Backend (`backend/.env`)
```ini
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/intellicart
JWT_SECRET=intellicart_super_secret_jwt_token_key_btech_2026
JWT_EXPIRES_IN=7d
AI_SERVICE_URL=http://127.0.0.1:8000
NODE_ENV=development
```

### 2. Frontend (`frontend/.env`)
```ini
VITE_API_URL=http://localhost:5000/api
```

### 3. AI Service (`recommendation-service/.env`)
```ini
PORT=8000
BACKEND_URL=http://127.0.0.1:5000/api
MONGODB_URI=mongodb://127.0.0.1:27017/intellicart
```

---

## 🏃 Running Instructions (Windows PowerShell / CMD)

To run the complete IntelliCart platform, open **3 separate terminal windows**:

### Terminal 1: Backend API Gateway
```powershell
cd backend
npm install
npm run seed     # Seeds 52+ products, categories, demo users, orders, and telemetry
npm run dev      # Launches Express server on http://localhost:5000
```

### Terminal 2: Python AI Recommendation Service
```powershell
cd recommendation-service
python -m pip install -r requirements.txt
python main.py   # Launches FastAPI recommendation service on http://localhost:8000
```

### Terminal 3: React Frontend Application
```powershell
cd frontend
npm install
npm run dev      # Launches Vite dev server on http://localhost:3000
```

Open your browser and navigate to **`http://localhost:3000`**.

---

## 🔑 Demo Personas for Viva & Evaluation

The login page features convenient 1-click test persona buttons:

| Persona | Email | Password | Role / Affinity |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@intellicart.com` | `admin123` | **ADMIN** (Access to `/admin` management portals) |
| **Rahul Sharma** | `rahul.tech@example.com` | `password123` | **USER** (High affinity for Laptops & Audio) |
| **Priya Patel** | `priya.fashion@example.com` | `password123` | **USER** (High affinity for Fashion & Luxury) |
| **Anita Roy** | `anita.fit@example.com` | `password123` | **USER** (High affinity for Gym & Fitness Gear) |
| **Vikram Mehta** | `vikram.books@example.com` | `password123` | **USER** (High affinity for Computer Science Books) |

---

## 🧪 Testing & Verification

### Run Backend API Integration Tests:
```powershell
cd backend
node tests/run-tests.js
```
*Verifies Health check, Category/Product setup, Registration, Login, Profile retrieval, Catalog search, Cart mutations, Order placement with stock decrement, Telemetry recording, AI gateway fallback, and Admin authorization guards.*

### Run Python Recommendation Unit Tests:
```powershell
cd recommendation-service
python test_recommendation.py
```
*Verifies TF-IDF Content Similarity, Item-Item Collaborative Filtering, Hybrid Fusion, Cold-Start Fallback, and Purchased Product Exclusion.*

---

## 📚 Academic Documentation & Diagrams

- **[Project Documentation](docs/PROJECT_DOCUMENTATION.md):** 16-section comprehensive B.Tech report covering Abstract, Methodology, Algorithms, Results, and Limitations.
- **[UML Diagrams](docs/DIAGRAMS.md):** Architecture, Use Case, Database ERD, Sequence, and Deployment diagrams.
- **[Viva Voce Preparation](docs/VIVA.md):** 18 technical questions and concise answers for viva defense.
