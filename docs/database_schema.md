# Database Schema Specification

## PostgreSQL / H2 Table Definitions

### Table: `assets`
- `id` (BIGINT, PRIMARY KEY, AUTO_INCREMENT)
- `asset_code` (VARCHAR(255), UNIQUE, NOT NULL)
- `name` (VARCHAR(255), NOT NULL)
- `category` (VARCHAR(255))
- `status` (VARCHAR(50)) -- AVAILABLE, RENTED, MAINTENANCE
- `daily_rate` (NUMERIC(19,2), NOT NULL)
- `latitude` (DOUBLE PRECISION)
- `longitude` (DOUBLE PRECISION)
- `created_at` (TIMESTAMP)

### Table: `rentals`
- `id` (BIGINT, PRIMARY KEY, AUTO_INCREMENT)
- `rental_code` (VARCHAR(255), UNIQUE, NOT NULL)
- `asset_id` (BIGINT, FOREIGN KEY -> assets.id)
- `customer_name` (VARCHAR(255), NOT NULL)
- `start_date` (DATE, NOT NULL)
- `end_date` (DATE)
- `total_amount` (NUMERIC(19,2))
- `status` (VARCHAR(50)) -- RESERVED, ACTIVE, COMPLETED, CANCELLED
- `created_at` (TIMESTAMP)
