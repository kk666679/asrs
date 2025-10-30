# ASRS API Reference

## Quick Reference - All 36 API Endpoints

### Infrastructure Management
```
GET/POST  /api/warehouses      - Warehouse CRUD
GET/POST  /api/zones           - Zone management (filter: warehouseId)
GET/POST  /api/aisles          - Aisle management (filter: zoneId)
GET/POST  /api/racks           - Rack management (filter: aisleId)
GET/POST  /api/locations       - Bin/location management
GET/POST  /api/users           - User management (filter: warehouseId, role)
```

### Inventory & Items
```
GET/POST  /api/items           - Item CRUD operations
GET/POST  /api/products        - Product management
GET       /api/inventory/batch - Batch inventory operations
GET       /api/inventory/reorder - Reorder point management
GET       /api/inventory/stock-levels - Stock level monitoring
```

### Operations
```
POST/PUT  /api/picking         - Optimized picking (POST: plan, PUT: execute)
POST/PUT  /api/putaway         - Smart putaway (POST: find, PUT: execute)
GET/POST  /api/transactions    - Movement transactions
```

### Analytics & Reporting
```
GET       /api/analytics       - KPIs and dashboard data (param: period)
GET/POST  /api/forecasting     - AI demand forecasting (GET: single, POST: batch)
GET       /api/reports         - Reports (param: type, startDate, endDate)
GET       /api/alerts          - Alert management
```

### Supply Chain
```
GET/POST  /api/shipments       - Shipment tracking
GET       /api/suppliers       - Supplier information
```

### IoT & Automation
```
GET/POST  /api/robots          - Robot management (filter: type, status, zoneId)
POST      /api/robot-commands  - Robot command execution
GET/POST  /api/sensors         - Sensor management (filter: type, status, zoneId, binId)
GET       /api/sensor-readings - Sensor data readings
GET       /api/equipment       - Combined robots & sensors overview
```

### Maintenance
```
GET       /api/maintenance     - Maintenance tasks (filter: status)
GET/PUT   /api/settings        - System settings
```

### Barcode Operations
```
POST      /api/barcodes/scan     - Scan barcode
GET       /api/barcodes/lookup   - Lookup barcode (param: barcode)
POST      /api/barcodes/generate - Generate barcode
POST      /api/barcodes/validate - Validate barcode
```

### Halal Management
```
GET/POST  /api/halal/products       - Halal products (filter: certified)
GET       /api/halal/certifications - Certification management
GET       /api/halal/dashboard      - Halal dashboard data
POST      /api/halal/simulation     - Halal simulation
GET       /api/halal/zones          - Halal zone management
```

## Usage Examples

### Create Warehouse
```typescript
POST /api/warehouses
{
  "code": "WH001",
  "name": "Main Warehouse",
  "address": "123 Storage St",
  "city": "Seattle",
  "country": "USA",
  "capacity": 10000
}
```

### Get Zones by Warehouse
```typescript
GET /api/zones?warehouseId=warehouse_id_here
```

### Create User
```typescript
POST /api/users
{
  "email": "operator@example.com",
  "name": "John Operator",
  "password": "secure_password",
  "role": "OPERATOR",
  "warehouseId": "warehouse_id_here"
}
```

### Generate Picking Plan
```typescript
POST /api/picking
{
  "items": [
    {
      "itemId": "item_id_1",
      "quantity": 10,
      "priority": "HIGH"
    }
  ],
  "constraints": {
    "maxWeight": 1000,
    "timeWindow": {
      "start": "2024-01-01T08:00:00Z",
      "end": "2024-01-01T17:00:00Z"
    }
  }
}
```

### Get Equipment Overview
```typescript
GET /api/equipment
// Returns: { robots: [...], sensors: [...] }
```

### Generate Report
```typescript
GET /api/reports?type=inventory&startDate=2024-01-01&endDate=2024-01-31
// Types: inventory, movements, shipments, summary
```

### Get Maintenance Tasks
```typescript
GET /api/maintenance?status=MAINTENANCE
// Returns: { bins: [...], robots: [...], sensors: [...], total: N }
```

## Response Formats

### Success Response
```json
{
  "id": "entity_id",
  "...": "entity_data"
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": "Optional details"
}
```

## Status Codes

- `200` - Success (GET)
- `201` - Created (POST)
- `400` - Bad Request (validation error)
- `404` - Not Found
- `409` - Conflict (duplicate)
- `500` - Server Error

## Authentication

Currently, all endpoints are open. Implement authentication middleware for production:

```typescript
// middleware.ts
export { default } from "next-auth/middleware"
export const config = { matcher: ["/api/:path*"] }
```

## Rate Limiting

Recommended rate limits:
- Standard endpoints: 100 req/min
- Analytics/Reports: 20 req/min
- Forecasting: 10 req/min

## Database Schema

All endpoints use Prisma ORM with PostgreSQL. See `prisma/schema.prisma` for complete schema.

## Testing

```bash
# Test endpoint
curl http://localhost:3000/api/warehouses

# Create entity
curl -X POST http://localhost:3000/api/warehouses \
  -H "Content-Type: application/json" \
  -d '{"code":"WH001","name":"Test Warehouse"}'
```
