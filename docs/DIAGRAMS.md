# IntelliCart - UML & Architecture Diagrams

This document contains standard Mermaid diagrams modeling the software engineering architecture, database design, user workflows, and machine learning pipelines of **IntelliCart**.

---

## 1. System Architecture Diagram

```mermaid
flowchart TD
    subgraph ClientLayer ["Client Layer (Presentation Tier)"]
        UI["React 18 + Vite SPA<br/>(Tailwind CSS, React Router, Context API)"]
    end

    subgraph GatewayLayer ["Backend API Gateway (Application Tier)"]
        API["Node.js / Express.js REST API Server<br/>(Port: 5000)"]
        AUTH["JWT & bcrypt Authentication Middleware"]
        ORDERS["Order & Inventory Controller"]
        TELEMETRY["Behavioral Interaction Logger"]
        AI_CLIENT["AI Integration Client with Circuit Breaker Fallback"]
    end

    subgraph DataLayer ["Data Persistence Tier"]
        MONGO[("MongoDB Database<br/>Port: 27017<br/>Collections: Users, Products, Categories, Orders, Cart, Wishlist, Reviews, Interactions")]
    end

    subgraph AILayer ["AI / ML Recommendation Engine Tier"]
        FASTAPI["Python FastAPI Service<br/>(Port: 8000)"]
        TFIDF["TF-IDF Vectorizer & Cosine Similarity"]
        COLLAB["Collaborative Filtering Engine<br/>(User-Item Interaction Matrix)"]
        HYBRID["Hybrid Fusion & Normalizer<br/>(0.40 Content + 0.40 Collab + 0.20 Intent)"]
        CACHE[("Model State Cache<br/>recommender_state.pkl")]
    end

    UI -->|"HTTP / REST API (JSON)"| API
    API --> AUTH
    API --> ORDERS
    API --> TELEMETRY
    API --> AI_CLIENT

    AUTH --> MONGO
    ORDERS --> MONGO
    TELEMETRY --> MONGO
    AI_CLIENT -.->|"Fallback to DB Popularity"| MONGO

    AI_CLIENT -->|"REST Requests (/recommendations)"| FASTAPI
    FASTAPI --> TFIDF
    FASTAPI --> COLLAB
    FASTAPI --> HYBRID
    HYBRID --> CACHE
    FASTAPI -.->|"Batch Data Sync (/interactions/export)"| API
```

---

## 2. Use Case Diagram

```mermaid
flowchart LR
    Customer((Online Customer))
    Admin((Administrator))

    subgraph IntelliCartPlatform ["IntelliCart E-Commerce Platform"]
        UC1(["Register & Sign In"])
        UC2(["Search & Filter Catalog"])
        UC3(["View Product Details & Specs"])
        UC4(["Manage Cart & Wishlist"])
        UC5(["Place Order (COD / Simulated Online)"])
        UC6(["Submit Verified Review"])
        UC7(["Receive AI Personalized Recommendations"])
        UC8(["Track Order Status & Cancel Orders"])
        
        UC9(["Manage Product Catalog & Stock"])
        UC10(["Manage Store Categories"])
        UC11(["Update Order Fulfillment Status"])
        UC12(["Manage User Accounts & Roles"])
        UC13(["Monitor Telemetry & Retrain AI Engine"])
    end

    Customer --> UC1
    Customer --> UC2
    Customer --> UC3
    Customer --> UC4
    Customer --> UC5
    Customer --> UC6
    Customer --> UC7
    Customer --> UC8

    Admin --> UC1
    Admin --> UC9
    Admin --> UC10
    Admin --> UC11
    Admin --> UC12
    Admin --> UC13
```

---

## 3. Database Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    USER ||--o{ ORDER : "places"
    USER ||--o{ REVIEW : "writes"
    USER ||--o{ INTERACTION : "generates"
    USER ||--|| CART : "owns"
    USER ||--|| WISHLIST : "maintains"

    CATEGORY ||--o{ PRODUCT : "contains"
    PRODUCT ||--o{ REVIEW : "receives"
    PRODUCT ||--o{ INTERACTION : "target_of"

    ORDER ||--|{ ORDER_ITEM : "includes"
    CART ||--o{ CART_ITEM : "holds"
    WISHLIST ||--o{ PRODUCT : "saves"

    USER {
        ObjectId _id PK
        string name
        string email UK
        string password
        string role "USER | ADMIN"
        string phone
        object address
        boolean isActive
        date createdAt
    }

    PRODUCT {
        ObjectId _id PK
        string name
        string slug UK
        string description
        ObjectId category FK
        string categoryName
        string brand
        number price
        number discount
        number finalPrice
        array images
        number stock
        number rating
        number numReviews
        array tags
        object specifications
        boolean isFeatured
    }

    CATEGORY {
        ObjectId _id PK
        string name UK
        string slug UK
        string description
        string image
        number itemCount
    }

    ORDER {
        ObjectId _id PK
        ObjectId user FK
        array orderItems
        object shippingAddress
        string paymentMethod "COD | CARD | UPI"
        number itemsPrice
        number taxPrice
        number shippingPrice
        number totalPrice
        boolean isPaid
        string orderStatus "CONFIRMED | PROCESSING | SHIPPED | DELIVERED | CANCELLED"
        date paidAt
        date deliveredAt
    }

    INTERACTION {
        ObjectId _id PK
        ObjectId userId FK
        ObjectId productId FK
        string action "PRODUCT_VIEW | SEARCH | WISHLIST | ADD_TO_CART | PURCHASE | RATING | REVIEW"
        number weight "1 to 5"
        object metadata
        date timestamp
    }

    REVIEW {
        ObjectId _id PK
        ObjectId product FK
        ObjectId user FK
        string userName
        number rating "1 to 5"
        string title
        string comment
        boolean isVerifiedPurchase
        date createdAt
    }
```

---

## 4. Sequence Diagram: Order Placement & Behavioral Telemetry

```mermaid
sequenceDiagram
    autonumber
    actor Customer as User (Browser)
    participant UI as React Frontend
    participant API as Node.js Gateway
    participant DB as MongoDB
    participant AI as Python AI Service

    Customer->>UI: Clicks "Confirm & Place Order"
    UI->>API: POST /api/orders (cart items, shipping address, payment method)
    API->>DB: Check active stock for each product
    alt Insufficient Stock
        DB-->>API: Stock is less than ordered quantity
        API-->>UI: 400 Bad Request (Stock error)
        UI-->>Customer: Display error toast notification
    else Stock Available
        DB-->>API: Stock validated
        API->>DB: Insert new Order record
        API->>DB: Atomically decrement stock ($inc: -quantity)
        API->>DB: Clear User Cart (items = [])
        API->>DB: Insert PURCHASE Interaction record (weight = 5)
        API-->>UI: 201 Created (Order object)
        UI-->>Customer: Redirect to /order-success/:id
        
        Note over API,AI: Subsequent Recommendation Call
        Customer->>UI: Navigates to /recommendations
        UI->>API: GET /api/recommendations
        API->>AI: GET /recommendations/user/:userId
        AI->>AI: Compute Hybrid Scores (Exclude purchased items)
        AI-->>API: 200 OK (Recommended products with reasons)
        API-->>UI: 200 OK (Product cards + rationale)
        UI-->>Customer: Render personalized product discovery
    end
```

---

## 5. Recommendation Engine Workflow Diagram

```mermaid
flowchart TD
    START(["Start: Recommendation Request for User U"]) --> CHECK_HIST{"Has User logged >= 2 interactions?"}
    
    CHECK_HIST -- "No (Cold-Start Persona)" --> COLD["Fetch Popular & Trending Products<br/>(High rating + review count)"]
    COLD --> OUT(["Return Top N Popular Products"])

    CHECK_HIST -- "Yes" --> PARALLEL["Parallel Feature Processing"]
    
    subgraph ContentBranch ["Content-Based Filtering (40%)"]
        CB1["Extract User Interacted Products"]
        CB2["Query Precomputed TF-IDF Cosine Similarity Matrix"]
        CB3["Aggregate & Normalize Similarity Scores (C_Score)"]
    end

    subgraph CollabBranch ["Collaborative Filtering (40%)"]
        CF1["Build Sparse User-Item Matrix from Telemetry"]
        CF2["Apply Action Weights:<br/>View=1, Search=2, Wishlist=3, Cart=4, Buy=5"]
        CF3["Compute Item-Item Cosine Similarity Vector"]
        CF4["Aggregate & Normalize Collaborative Scores (CF_Score)"]
    end

    subgraph BehaviorBranch ["Behavioral Intent & Recency (20%)"]
        BF1["Identify Dominant Category Affinities"]
        BF2["Assign Intent Score (B_Score)"]
    end

    PARALLEL --> ContentBranch
    PARALLEL --> CollabBranch
    PARALLEL --> BehaviorBranch

    ContentBranch --> FUSION["Hybrid Weighted Fusion<br/>Score = 0.40(C) + 0.40(CF) + 0.20(B)"]
    CollabBranch --> FUSION
    BehaviorBranch --> FUSION

    FUSION --> FILTER{"Filter Candidate Products"}
    FILTER -->|"Exclude Already Purchased"| F1["Filter Purchased"]
    FILTER -->|"Exclude Out of Stock (Stock <= 0)"| F2["Filter Out-of-Stock"]

    F1 --> RANK["Sort by Hybrid Score Descending"]
    F2 --> RANK

    RANK --> REASON["Generate Human-Readable Rationale<br/>('Because you bought...', 'Popular among users like you')"]
    REASON --> OUT_REC(["Return Top N Personalized Recommendations"])
```

---

## 6. Deployment Architecture Diagram

```mermaid
flowchart TD
    subgraph Host ["Single Machine / Cloud VM (Localhost)"]
        subgraph Port3000 ["Port 3000: Web Frontend"]
            VITE["Vite Dev Server / Nginx Static Bundle<br/>React 18 Single Page Application"]
        end

        subgraph Port5000 ["Port 5000: API Gateway"]
            NODE["Node.js / Express.js Gateway<br/>CORS, JWT, Mongoose, REST Controller"]
        end

        subgraph Port8000 ["Port 8000: Machine Learning Microservice"]
            UVI["Uvicorn ASGI Server<br/>FastAPI Recommender Engine<br/>scikit-learn, pandas, numpy"]
        end

        subgraph Port27017 ["Port 27017: Persistence Layer"]
            MONGOD[("MongoDB Community Server<br/>Database: intellicart")]
        end
    end

    UserAgent((Browser User)) -->|"Port 3000"| VITE
    VITE -->|"REST API Calls (:5000)"| NODE
    NODE -->|"Mongoose ODM (:27017)"| MONGOD
    NODE -->|"HTTP Microservice Proxy (:8000)"| UVI
    UVI -.->|"Periodic Sync / Train (:5000)"| NODE
```
