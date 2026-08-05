# API Specification Overview

## Spring Boot Backend REST Endpoints (Port 8080)

- `GET /api/health` - Check backend service health status.
- `GET /api/assets` - Retrieve list of all rental assets.
- `POST /api/assets` - Register a new equipment asset.
- `GET /api/rentals` - Retrieve active rental contracts.
- `POST /api/rentals` - Create a new rental agreement.
- `GET /swagger-ui.html` - Interactive OpenAPI Swagger UI.

---

## FastAPI Analytics Service Endpoints (Port 8000)

- `GET /health` - Service health status check.
- `GET /analytics/summary` - Aggregated fleet telemetry & revenue metrics.
- `POST /generate-synthetic-data` - Trigger Faker/NumPy synthetic telemetry pipeline.
- `POST /analytics/predict-risk` - Predict asset maintenance risk probability.
- `GET /docs` - Interactive FastAPI Swagger UI.
