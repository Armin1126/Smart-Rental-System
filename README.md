# Smart Rental Asset Tracking System

A Caterpillar-inspired equipment rental operations platform built for post-checkout asset lifecycle management, live IoT telemetry tracking, demand forecasting, under-utilization detection, and predictive recommendation engine.

---

## 📌 Project Overview

The **Smart Rental Asset Tracking System** begins **AFTER** heavy machinery and equipment have been rented out. It provides Caterpillar-grade operational visibility across the post-checkout lifecycle:

```text
Check-Out ──► Assign Equipment to Site/Operator ──► Live Telemetry Tracking ──► Dashboard Monitoring
                                                                                       │
Check-In ◄── Recommendation Engine ◄── Demand Forecasting ◄── Under-utilization ◄── Alerts
```

### Core Operations
1. **Check-Out & Assignment**: Dispatch equipment to physical job sites and assigned operators.
2. **Live Telemetry Tracking**: Real-time GPS location, engine temp, vibration, battery, and fuel level monitoring.
3. **Dashboard Monitoring**: Fleet-wide health metrics, utilization rates, and interactive map views.
4. **Alerts & Anomaly Detection**: Automated notifications for geofence breaches, maintenance flags, and vibration anomalies.
5. **Demand Forecasting & Recommendations**: ML-assisted equipment reallocation, predictive maintenance, and dynamic pricing advice.
6. **Check-In Processing**: Automated return inspection, usage hours calculation, and lease completion.

---

## 🏗️ System Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        React + Vite Frontend (JS)                      │
│                Port: 5173 | Tailwind CSS | Material UI | Leaflet      │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │ REST APIs                      │ REST APIs
                    ▼                                ▼
┌──────────────────────────────────────┐ ┌───────────────────────────────┐
│       Spring Boot 3 Backend API      │ │    FastAPI Analytics Service  │
│      Port: 8080 | Java 21 | JPA      │ │   Port: 8000 | Python | Pandas  │
└───────────────────┬──────────────────┘ └───────────────────────────────┘
                    │                                
                    ▼                                
┌──────────────────────────────────────┐             
│      PostgreSQL 16 Database          │             
│        (H2 Local Dev Fallback)       │             
└──────────────────────────────────────┘             
```

---

## 📁 Folder Structure

```text
SmartRentalSystem/
├── frontend/             # React + Vite + JavaScript UI application
│   ├── src/
│   │   ├── components/  # Navbar, Sidebar, MetricCard, AssetTable, TelemetryTable, etc.
│   │   ├── pages/       # Dashboard, Assets, CheckOut, CheckIn, Telemetry, Alerts, etc.
│   │   ├── layouts/     # MainLayout wrapper
│   │   ├── services/    # Axios client & module API services
│   │   ├── hooks/       # Custom React hooks (useAssets, useTelemetry, etc.)
│   │   ├── context/     # AppContext global state
│   │   ├── constants/   # Mock data & application constants
│   │   └── utils/       # Formatter functions
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── backend/              # Spring Boot 3 Java 21 REST API backend
│   ├── src/main/java/com/smartrental/
│   │   ├── controller/  # Dashboard, Asset, Rental, Telemetry, Alert, Recommendation controllers
│   │   ├── entity/      # Asset, Site, Operator, RentalRecord, TelemetryLog, Alert, Recommendation
│   │   ├── repository/  # Spring Data JPA repositories
│   │   ├── service/     # Business logic interfaces
│   │   ├── dto/         # Request & Response Data Transfer Objects
│   │   ├── mapper/      # Entity-DTO mapping utilities
│   │   ├── config/      # CorsConfig & SwaggerConfig
│   │   ├── scheduler/   # Telemetry & Alert Spring Scheduler jobs
│   │   ├── analytics/   # Analytics service integration client
│   │   ├── util/        # Application constants
│   │   └── exception/   # ResourceNotFoundException & GlobalExceptionHandler
│   ├── src/main/resources/application.yml
│   └── pom.xml
├── analytics/            # Python FastAPI data science & synthetic generator service
│   ├── generator/       # Synthetic IoT telemetry dataset generator module
│   ├── forecast/        # Demand forecasting placeholder module
│   ├── anomaly/         # Vibration & temp anomaly detector module
│   ├── recommendation/  # Reallocation & maintenance recommendation engine
│   ├── api/             # FastAPI route declarations
│   ├── api.py           # FastAPI entry point
│   ├── requirements.txt
│   └── .venv/           # Python virtual environment
├── datasets/             # Sample CSV datasets (Assets, Sites, Operators, Telemetry, Rentals)
├── docs/                 # Architecture, API spec, and database schema documentation
├── postman/              # Postman API Collection JSON
├── .github/              # CI workflows & issue templates
├── .env.example
├── docker-compose.yml
├── LICENSE
└── README.md
```

---

## 🛠️ Technology Stack

| Component | Framework / Library | Primary Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, JavaScript | Component-driven SPA user interface |
| **Styling** | Tailwind CSS, Material UI | Modern dark mode Caterpillar-themed UI |
| **Mapping & Charts**| Leaflet, Recharts | Interactive GPS mapping & telemetry trend lines |
| **Backend** | Spring Boot 3.3, Java 21, Maven | Core REST API, persistence & scheduling |
| **Database** | PostgreSQL / H2 in-memory | Relational storage & local dev zero-config |
| **OpenAPI** | Springdoc OpenAPI (Swagger UI) | Interactive REST API documentation at `/swagger-ui.html` |
| **Analytics** | Python 3.11+, FastAPI, Uvicorn | Telemetry data synthesis & predictive ML endpoints |
| **Data Science** | Pandas, NumPy, Scikit-Learn, Faker | Feature engineering & analytics |

---

## 🚀 How to Run

### 1. Frontend (`frontend/`)

```bash
cd frontend
npm install
npm run dev
```
> Application running at: `http://localhost:5173`

---

### 2. Backend (`backend/`)

```bash
cd backend
mvn spring-boot:run
```
> REST API running at: `http://localhost:8080`  
> OpenAPI Swagger UI: `http://localhost:8080/swagger-ui.html`

---

### 3. Analytics (`analytics/`)

```bash
cd analytics
python -m venv .venv

# On Windows:
.\.venv\Scripts\activate
# On macOS/Linux:
# source .venv/bin/activate

pip install -r requirements.txt
uvicorn api:app --reload
```
> Analytics Service running at: `http://localhost:8000`  
> Interactive OpenAPI Docs: `http://localhost:8000/docs`

---

## 🔌 API Overview

### Backend Endpoints (`http://localhost:8080/api`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check endpoint |
| `GET` | `/api/dashboard` | Aggregated operational metrics summary |
| `GET` | `/api/assets` | Get list of tracked equipment assets |
| `POST` | `/api/rentals/checkout` | Dispatch asset to site and operator |
| `POST` | `/api/rentals/checkin` | Process equipment return & inspection |
| `POST` | `/api/telemetry` | Ingest IoT sensor reading log |
| `GET` | `/api/alerts` | List active maintenance & geofence alerts |
| `GET` | `/api/recommendations` | Get predictive ML optimization recommendations |

### Analytics Endpoints (`http://localhost:8000`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Service health status |
| `POST` | `/generate` | Trigger synthetic IoT telemetry generator |
| `GET` | `/forecast` | Get equipment demand forecast metrics |
| `GET` | `/anomalies` | Retrieve detected telemetry anomalies |
| `GET` | `/recommendations` | Get AI asset reallocation recommendations |

---

## 🌿 Git Workflow & Branch Strategy

The repository follows a feature-branch collaboration strategy for four parallel developers:

```text
main ───────────────────────────────────────────────────────────── (Production Stable)
  │
  ├── feature/backend      (Developer 1: Spring Boot Controllers, JPA, DB)
  ├── feature/frontend     (Developer 2: React Pages, UI Components, Maps)
  ├── feature/analytics    (Developer 3: FastAPI, Data Synthesizer, ML)
  └── feature/integration  (Developer 4: API Wiring, End-to-End Workflows)
```

### Git Branch Creation & Push Commands

```bash
# Create feature branch
git checkout -b feature/backend

# Commit changes using conventional commits format
git add .
git commit -m "feat(backend): add TelemetryLog entity and repository"

# Push feature branch
git push origin feature/backend
```

---

## 🤝 Contribution Guide

1. Clone repository: `git clone <repo-url>`
2. Create a feature branch off `main`: `git checkout -b feature/<your-feature>`
3. Follow project naming conventions:
   - Java: `PascalCase` classes, `camelCase` fields, `snake_case` database tables.
   - JavaScript: `PascalCase.jsx` components, `camelCase.js` utility functions.
   - Python: `snake_case.py` files and functions, `PascalCase` classes.
4. Ensure all builds pass (`npm run build`, `mvn compile`, `python -m py_compile`) before opening a Pull Request.

---

## 📄 License

Distributed under the MIT License. See [LICENSE](file:///c:/Users/Srivatsan/Smart-rental/LICENSE) for details.
