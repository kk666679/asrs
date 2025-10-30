# ASRS System Features Location Mapping

This document maps the core features from `TODO_SYSTEM_FEATURES_ARCHITECTURE.md` to their implementation locations in the codebase.

## 1.0 INVENTORY MANAGEMENT SYSTEM

### 1.1 Product Master Data Management
- **API Routes**: `app/api/items/route.ts`, `app/api/products/route.ts`
- **Components**: `components/ItemManager.tsx`, `components/products/`
- **Database**: Prisma schema (Item, Product models)

### 1.2 Real-Time Inventory Control
- **API Routes**: `app/api/inventory/route.ts`, `app/api/inventory/stock-levels/route.ts`, `app/api/inventory/reorder/route.ts`
- **Components**: `components/StorageRetrieval.tsx`
- **Database**: Prisma schema (BinItem, Movement models)

### 1.3 Batch & Lot Management
- **API Routes**: `app/api/inventory/batch/route.ts`
- **Database**: Prisma schema (BinItem with batchNumber, expiryDate fields)

### 1.4 Warehouse Storage Management
- **API Routes**: `app/api/warehouses/route.ts`, `app/api/zones/route.ts`, `app/api/aisles/route.ts`, `app/api/racks/route.ts`, `app/api/locations/route.ts`
- **Components**: `components/LocationManager.tsx`, `components/warehouse/`
- **Database**: Prisma schema (Warehouse, Zone, Aisle, Rack, Bin models)

## 2.0 HALAL COMPLIANCE SYSTEM

### 2.1 Halal Certification Management
- **API Routes**: `app/api/halal/certifications/route.ts`
- **Components**: `components/halal/`
- **Database**: Prisma schema (HalalCertification model)

### 2.2 Physical Segregation Management
- **API Routes**: `app/api/halal/zones/route.ts`
- **Database**: Prisma schema (Zone with halal segregation fields)

### 2.3 Ingredient Compliance Management
- **API Routes**: `app/api/halal/products/route.ts`
- **Database**: Prisma schema (Product with halal compliance fields)

### 2.4 Process Compliance Monitoring
- **API Routes**: `app/api/halal/simulation/route.ts`
- **Components**: `app/halal/page.tsx`, `app/halal-dashboard/page.tsx`
- **Database**: Prisma schema (HalalProcess, ComplianceLog models)

## 3.0 ASRS AUTOMATION SYSTEM

### 3.1 Robotics Control & Management
- **API Routes**: `app/api/robots/route.ts`, `app/api/robot-commands/route.ts`
- **Backend**: `backend/src/modules/robots/robots.service.ts`, `backend/src/modules/robots/robots.controller.ts`
- **Components**: `components/robots/`, `app/robots/page.tsx`
- **Database**: Prisma schema (Robot, RobotCommand models)

### 3.2 Storage Optimization Engine
- **API Routes**: `app/api/picking/route.ts`, `app/api/putaway/route.ts`
- **Libraries**: `lib/algorithms/picking.ts`, `lib/algorithms/putaway.ts`
- **Database**: Prisma schema (Movement, Task models)

### 3.3 Material Handling Integration
- **API Routes**: `app/api/transactions/route.ts`, `app/api/shipments/route.ts`
- **Components**: `components/transactions/`, `components/shipments/`
- **Database**: Prisma schema (Transaction, Shipment models)

## 4.0 DIGITAL TWIN & SIMULATION

### 4.1 Virtual Warehouse Modeling
- **Components**: `app/digital-twin/page.tsx`
- **Libraries**: `lib/digital-twin/twin-engine.ts`
- **Database**: Prisma schema (DigitalTwin, Simulation models)

### 4.2 Simulation & Forecasting
- **API Routes**: `app/api/forecasting/route.ts`, `app/api/forecasting/batch/route.ts`
- **Components**: `app/forecasting/page.tsx`
- **Libraries**: `lib/forecasting.ts`

## 5.0 MULTI-AGENT INTELLIGENCE SYSTEM

### 5.1 Autonomous Agent Framework
- **Libraries**: `lib/ai-agents/agent-orchestrator.ts`
- **Database**: Prisma schema (Agent, AgentMessage models)

### 5.2 Specialized Intelligent Agents
- **Libraries**: `lib/ai-agents/inventory-agent.ts`
- **Components**: Integrated in `app/digital-twin/page.tsx`

## 6.0 BLOCKCHAIN TRACEABILITY

### 6.1 Supply Chain Provenance
- **Note**: Not implemented in current codebase - placeholder for future blockchain integration

### 6.2 Smart Contract Automation
- **Note**: Not implemented in current codebase - placeholder for future blockchain integration

## 7.0 IOT SENSOR NETWORK

### 7.1 Environmental Monitoring
- **API Routes**: `app/api/sensors/route.ts`, `app/api/sensor-readings/route.ts`
- **Components**: `components/sensors/`
- **Database**: Prisma schema (Sensor, SensorReading models)

### 7.2 Equipment Monitoring
- **API Routes**: `app/api/equipment/route.ts`, `app/api/maintenance/route.ts`
- **Components**: `components/equipment/`, `components/maintenance/`
- **Database**: Prisma schema (Equipment, Maintenance models)

## 8.0 ANALYTICS & BUSINESS INTELLIGENCE

### 8.1 Real-Time Operational Analytics
- **API Routes**: `app/api/analytics/route.ts`
- **Components**: `app/analytics/page.tsx`, `components/AnalyticsDashboard.tsx`
- **Database**: Prisma schema (Analytics, KPI models)

### 8.2 Predictive Analytics
- **API Routes**: `app/api/forecasting/route.ts`
- **Libraries**: `lib/forecasting.ts`
- **Components**: `app/forecasting/page.tsx`

## 9.0 MOBILE & FIELD OPERATIONS

### 9.1 Mobile Warehouse Operations
- **Components**: `app/operations/page.tsx`, `components/BarcodeScanner.tsx`
- **API Routes**: `app/api/barcodes/scan/route.ts`, `app/api/barcodes/validate/route.ts`

### 9.2 Driver & Delivery Operations
- **API Routes**: `app/api/transactions/route.ts`, `app/api/shipments/route.ts`
- **Components**: `components/shipments/`, `components/transactions/`
- **Database**: Prisma schema (Shipment, Transaction models)

---

## Implementation Status Summary

- ✅ **Fully Implemented**: 1.0, 2.0, 3.0, 4.0, 5.0, 7.0, 8.0, 9.0
- ⚠️ **Partially Implemented**: None
- ❌ **Not Implemented**: 6.0 (Blockchain Traceability)

## Key Integration Points

- **Database Layer**: Prisma ORM with comprehensive schema
- **API Layer**: Next.js API routes with RESTful endpoints
- **Frontend Layer**: React components with real-time updates
- **Backend Services**: NestJS modules for complex business logic
- **Libraries**: Custom algorithms and AI agents
- **UI/UX**: Dashboard pages for each major feature area

This mapping ensures all features are correctly located and accessible for development, maintenance, and future enhancements.
