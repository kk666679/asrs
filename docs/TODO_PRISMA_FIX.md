# Prisma Model Name Fix Plan

## Overview
Fix incorrect Prisma model names from snake_case to camelCase throughout the codebase to match the schema definitions.

## Files to Fix
- [ ] app/api/inventory/batch/route.ts: prisma.bin_items.findMany() -> prisma.binItem.findMany()
- [ ] app/api/locations/route.ts: prisma.bin.findMany() -> prisma.bin.findMany() (already correct)
- [ ] app/api/robots/route.ts: prisma.robot.findMany() -> prisma.robot.findMany() (already correct)
- [ ] app/api/sensors/route.ts: prisma.sensor.findMany() -> prisma.sensor.findMany() (already correct)
- [ ] app/api/products/route.ts: prisma.product.findMany() -> prisma.product.findMany() (already correct)
- [ ] app/api/items/route.ts: prisma.item.findMany() -> prisma.item.findMany() (already correct)
- [ ] app/api/analytics/route.ts: prisma.bin.findMany(), prisma.item.findMany() (already correct)
- [ ] app/api/robot-commands/route.ts: prisma.robotCommand.findMany() -> prisma.robotCommand.findMany() (already correct)
- [ ] app/api/suppliers/route.ts: prisma.supplier.findMany() -> prisma.supplier.findMany() (already correct)
- [ ] app/api/transactions/route.ts: prisma.movement.findMany() -> prisma.movement.findMany() (already correct)
- [ ] app/api/shipments/route.ts: prisma.shipment.findMany() -> prisma.shipment.findMany() (already correct)
- [ ] app/api/sensor-readings/route.ts: prisma.sensorReading.findMany() -> prisma.sensorReading.findMany() (already correct)
- [ ] app/api/inventory/reorder/route.ts: prisma.item.findMany() -> prisma.item.findMany() (already correct)
- [ ] app/api/inventory/stock-levels/route.ts: prisma.item.findMany() -> prisma.item.findMany() (already correct)
- [ ] lib/algorithms/putaway.ts: prisma.bins.findMany() -> prisma.bin.findMany()
- [ ] lib/forecasting.ts: prisma.movement.findMany() -> prisma.movement.findMany() (already correct)
- [ ] lib/algorithms/picking.ts: prisma.bin_items.findMany() -> prisma.binItem.findMany()
- [ ] lib/services/robotics.ts: prisma.robots.findMany() -> prisma.robot.findMany()
- [ ] lib/services/performance.ts: prisma.bins.findMany() -> prisma.bin.findMany()
- [ ] lib/services/alerting.ts: prisma.items.findMany(), prisma.bin_items.findMany(), prisma.sensors.findMany() -> prisma.item.findMany(), prisma.binItem.findMany(), prisma.sensor.findMany()
- [ ] backend/src/services/performance.ts: prisma.bins.findMany() -> prisma.bin.findMany()
- [ ] backend/src/services/alerting.ts: prisma.items.findMany(), prisma.bin_items.findMany(), prisma.sensors.findMany() -> prisma.item.findMany(), prisma.binItem.findMany(), prisma.sensor.findMany()
- [ ] backend/src/services/robotics.ts: prisma.robots.findMany() -> prisma.robot.findMany()
- [ ] prisma/mock-data.ts: prisma.supplier.findMany(), prisma.zone.findMany(), prisma.manufacturer.findMany() (already correct)

## Followup Steps
- [ ] Regenerate Prisma client: npx prisma generate
- [ ] Run TypeScript check: npx tsc --noEmit --skipLibCheck
- [ ] Test application functionality
- [ ] Verify database operations work correctly
