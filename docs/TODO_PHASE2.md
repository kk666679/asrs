npm# Phase 2: State Management & Data Layer Implementation

## Overview
Implement Zustand stores, TanStack Query setup, custom hooks, and WebSocket infrastructure for real-time updates across the ASRS system.

## Tasks

### 1. TanStack Query Setup
- [x] Add QueryClient and QueryClientProvider to app/layout.tsx
- [x] Configure default query options (stale time, cache time, error handling)
- [x] Set up React Query DevTools for development

### 2. Zustand Stores Implementation
- [x] Create base store structure in lib/stores/
- [x] Implement core module stores:
  - [x] Equipment store (lib/stores/equipment.ts)
  - [x] Robots store (lib/stores/robots.ts)
  - [x] Sensors store (lib/stores/sensors.ts)
  - [x] Inventory store (lib/stores/inventory.ts)
  - [x] Alerts store (lib/stores/alerts.ts)
- [ ] Implement additional module stores:
  - [x] Maintenance store (lib/stores/maintenance.ts)
  - [x] Operations store (lib/stores/operations.ts)
  - [x] Shipments store (lib/stores/shipments.ts)
  - [x] Locations store (lib/stores/locations.ts)
  - [x] Items store (lib/stores/items.ts)

### 3. Custom Hooks Creation
- [x] Create base hook utilities in lib/hooks/
- [x] Implement custom hooks for core modules:
  - [x] useEquipment (equipment data + API calls)
  - [x] useRobots (robots data + commands)
  - [x] useSensors (sensor data + real-time updates)
  - [x] useInventory (inventory data + updates)
  - [x] useAlerts (alerts data + notifications)
- [ ] Implement additional custom hooks:
  - [x] useMaintenance
  - [x] useOperations
  - [x] useShipments
  - [x] useLocations
  - [x] useItems

### 4. WebSocket Infrastructure
- [x] Create WebSocket connection utility (lib/websocket.ts)
- [x] Implement real-time event handlers for:
  - [x] Equipment status updates
  - [x] Robot position/command updates
  - [x] Sensor data streams
  - [x] Alert notifications
  - [x] Inventory changes
- [x] Add WebSocket integration to Zustand stores
- [x] Handle connection errors and reconnections
- [x] Extend WebSocket events for additional modules (maintenance, operations, shipments, locations, items)

### 5. Integration and Testing ✅
- [x] Update existing pages to use new hooks (equipment, robots, sensors, inventory, alerts, maintenance)
- [x] Test real-time updates functionality
- [x] Verify API caching with TanStack Query
- [x] Performance testing for state updates

## Implementation Order
1. Start with TanStack Query setup (foundational)
2. Implement core Zustand stores (equipment, robots, sensors)
3. Create corresponding custom hooks
4. Add WebSocket infrastructure
5. Expand to additional modules
6. Integrate with existing pages

## Dependencies
- Zustand (^5.0.8) - installed
- @tanstack/react-query (^5.90.5) - installed
- socket.io-client (^4.8.1) - installed
