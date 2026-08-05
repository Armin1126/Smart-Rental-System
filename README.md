# Smart Rental Asset Tracking System

A full-stack, analytics-driven asset rental tracking platform built for high-scale IoT monitoring, rental lifecycle management, and predictive asset maintenance analytics.

---

## 📌 Project Overview

The **Smart Rental Asset Tracking System** is designed for businesses managing fleet assets, heavy machinery, high-value tools, and electronics available for short and long-term rental. The system provides real-time visibility into asset location, utilization rates, rental agreements, maintenance schedules, and anomaly detection.

### Key Capabilities
- **Asset Management**: Real-time asset inventory, status tracking, and location mapping.
- **Rental Lifecycle**: Reservation, check-out/check-in processing, rate calculation, and billing integration.
- **Analytics & Telemetry**: Machine learning-based maintenance predictions, usage metrics, and synthetic telemetry generation.
- **API First Architecture**: Comprehensive REST APIs documented via OpenAPI/Swagger.

---

## 📁 Folder Structure

```text
SmartRentalSystem/
├── frontend/             # React + Vite + TypeScript UI app
│   ├── src/
│   │   ├── components/  # Reusable UI components (Navbar, AssetCard, etc.)
│   │   ├── pages/       # Application views (Dashboard, Assets, Rentals, Analytics)
│   │   ├── services/    # Axios API client setup
│   │   ├── App.tsx      # Routing configuration
│   │   └── main.tsx     # App entry point
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── backend/              # Spring Boot 3 Java 21 REST API service
│   ├── src/main/java/com/smartrental/
│   │   ├── controller/  # REST controllers (AssetController, RentalController, HealthController)
│   │   ├── model/       # JPA domain entities (Asset, Rental)
│   │   ├── repository/  # Spring Data JPA repositories
│   │   └── service/     # Business logic interfaces
│   ├── src/main/resources/
│   │   └── application.yml
│   └── pom.xml
├── analytics/            # Python FastAPI & Scikit-Learn data science module
│   ├── synthetic_data_generator.py # IoT and rental data generator
│   ├── analytics.py      # Pandas & Scikit-learn data processing & risk model
│   ├── api.py            # FastAPI service exposing endpoints
│   └── requirements.txt  # Python package dependencies
├── docs/                 # System architecture and API documentation
│   ├── architecture.md
│   ├── api_spec.md
│   └── database_schema.md
├── docker-compose.yml    # Database container orchestration
├── .gitignore
├── LICENSE
└── README.md
```

---

## 🛠️ Tech Stack

| Module | Core Technologies | Key Libraries & Tools |
| :--- | :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite | Material UI, Tailwind CSS, Axios, React Router v6, Recharts |
| **Backend** | Spring Boot 3, Java 21, Maven | Spring Web, Spring Data JPA, PostgreSQL / H2, Lombok, DevTools, OpenAPI (Swagger UI) |
| **Analytics** | Python 3.13, FastAPI | Pandas, NumPy, Scikit-Learn, Faker, Uvicorn |
| **Infra/Docs** | Docker Compose, Markdown | PostgreSQL 16 |

---

## 🚀 How to Run

### Prerequisites
- Node.js (v18+) & `npm`
- Java 21 JDK & Maven 3.8+
- Python 3.10+
- (Optional) Docker & Docker Compose for PostgreSQL

---

### 1. Frontend (`frontend/`)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (if not already installed)
npm install

# Start Vite development server
npm run dev
```

> Application running at: `http://localhost:5173`

---

### 2. Backend (`backend/`)

```bash
# Navigate to backend directory
cd backend

# Compile and start Spring Boot application
mvn spring-boot:run
```

> Service running at: `http://localhost:8080`  
> OpenAPI Swagger Documentation: `http://localhost:8080/swagger-ui.html`

*Note: Out of the box, the backend starts with an embedded H2 database for effortless zero-config development. To connect to PostgreSQL, start `docker-compose up -d` from the root directory and select the `postgres` profile in `application.yml`.*

---

### 3. Analytics (`analytics/`)

```bash
# Navigate to analytics directory
cd analytics

# Create & activate Python virtual environment
python -m venv .venv

# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
# source .venv/bin/activate

# Install required dependencies
pip install -r requirements.txt

# Start FastAPI server with Uvicorn
uvicorn api:app --reload
```

> Analytics Service running at: `http://localhost:8000`  
> Interactive FastAPI OpenAPI Docs: `http://localhost:8000/docs`

---

## 🤝 How to Contribute

1. **Fork the Repository**: Create your feature branch off `main`.
2. **Coding Standards**:
   - Frontend: Follow standard TypeScript strict modes and ESLint guidelines.
   - Backend: Maintain standard Java code formatting and Lombok conventions.
   - Analytics: Adhere to PEP 8 syntax standards for Python code.
3. **Commit Guidelines**: Use clear, concise commit messages following conventional commits format (`feat:`, `fix:`, `docs:`, `refactor:`).
4. **Submit a Pull Request**: Provide a thorough summary of changes and reference relevant issues.

---

## 🔄 Git Workflow

```bash
# Feature Branching Strategy
git checkout -b feat/asset-geofencing-api

# Commit incremental changes
git add .
git commit -m "feat: add geofence telemetry evaluation to analytics module"

# Keep feature branch synchronized with main
git fetch origin
git rebase origin/main

# Push branch and open Pull Request
git push origin feat/asset-geofencing-api
```

---

## 📄 License

Distributed under the MIT License. See [LICENSE](file:///c:/Users/Srivatsan/Smart-rental/LICENSE) for details.
