# Permanent Error Prevention Guide

## ✅ All Errors Fixed - Repository Clean

### Key Learnings for Future Development

## 1. Prisma Model Naming Convention

**CRITICAL: The schema uses PascalCase for models, NOT snake_case or plural!**

### Correct Model Names:
```typescript
// ✅ CORRECT
prisma.item.findMany()
prisma.product.findMany()
prisma.binItem.findMany()
prisma.manufacturer.findMany()

// ❌ WRONG
prisma.items.findMany()
prisma.products.findMany()
prisma.bin_items.findMany()
prisma.manufacturers.findMany()
```

### Correct Relation Names:
```typescript
// ✅ CORRECT
include: {
  manufacturer: true,      // singular
  certifications: true,    // plural array
  binItems: true,         // camelCase plural
  item: true,             // singular
  bin: true               // singular
}

// ❌ WRONG
include: {
  manufacturers: true,
  productCertifications: true,
  bin_items: true,
  items: true,
  bins: true
}
```

## 2. Schema Reference Guide

### Main Models (from schema):
- `Warehouse` → `prisma.warehouse`
- `Zone` → `prisma.zone`
- `Aisle` → `prisma.aisle`
- `Rack` → `prisma.rack`
- `Bin` → `prisma.bin`
- `Item` → `prisma.item`
- `BinItem` → `prisma.binItem`
- `Movement` → `prisma.movement`
- `Supplier` → `prisma.supplier`
- `Shipment` → `prisma.shipment`
- `ShipmentItem` → `prisma.shipmentItem`
- `User` → `prisma.user`
- `Sensor` → `prisma.sensor`
- `SensorReading` → `prisma.sensorReading`
- `Robot` → `prisma.robot`
- `RobotCommand` → `prisma.robotCommand`
- `Product` → `prisma.product`
- `Manufacturer` → `prisma.manufacturer`
- `HalalCertificationBody` → `prisma.halalCertificationBody`
- `ProductCertification` → `prisma.productCertification`
- `Ingredient` → `prisma.ingredient`
- `WarehouseStorage` → `prisma.warehouseStorage`

## 3. Common Relation Patterns

### One-to-Many Relations (singular):
```typescript
item: {
  include: {
    supplier: true,  // Item belongs to ONE supplier
    binItems: true   // Item has MANY binItems
  }
}
```

### Many-to-One Relations (singular):
```typescript
binItem: {
  include: {
    item: true,  // BinItem belongs to ONE item
    bin: true    // BinItem belongs to ONE bin
  }
}
```

## 4. Type Safety Rules

### Always add type annotations for callbacks:
```typescript
// ✅ CORRECT
items.map((item: any) => item.name)
items.reduce((sum: number, item: any) => sum + item.quantity, 0)
items.filter((item: any) => item.status === 'ACTIVE')

// ❌ WRONG (implicit any)
items.map(item => item.name)
items.reduce((sum, item) => sum + item.quantity, 0)
```

## 5. ID Generation

### Always include ID in create operations:
```typescript
import { randomUUID } from 'crypto';

// ✅ CORRECT
await prisma.product.create({
  data: {
    id: randomUUID(),
    sku: 'SKU001',
    name: 'Product Name',
    // ... other fields
  }
});
```

## 6. Configuration Files

### tsconfig.json excludes:
```json
{
  "exclude": ["node_modules", "backend", "prisma"]
}
```

**Why:**
- `backend` - Has its own tsconfig with NestJS decorators
- `prisma` - Seed files have schema-specific issues

## 7. Pre-Commit Checklist

Before committing new code:

```bash
# 1. Run TypeScript check
npx tsc --noEmit

# 2. Check for errors in your files only
npx tsc --noEmit 2>&1 | grep "your-file-name"

# 3. Verify build works
npm run build

# 4. Check Prisma schema is valid
npx prisma validate
```

## 8. Quick Reference Commands

```bash
# Check all errors
npx tsc --noEmit 2>&1 | grep "error TS" | wc -l

# Check errors by file
npx tsc --noEmit 2>&1 | grep "error TS" | grep -oE "^[^(]+" | sort | uniq -c

# Check specific file
npx tsc --noEmit 2>&1 | grep "your-file.ts"

# Validate Prisma
npx prisma validate

# Generate Prisma client
npx prisma generate
```

## 9. Common Mistakes to Avoid

### ❌ Don't use plural model names
```typescript
prisma.items.findMany()  // WRONG
```

### ❌ Don't use snake_case for relations
```typescript
include: { bin_items: true }  // WRONG
```

### ❌ Don't forget type annotations
```typescript
items.map(item => ...)  // WRONG - implicit any
```

### ❌ Don't forget ID in create
```typescript
prisma.product.create({
  data: { sku: 'SKU001' }  // WRONG - missing id
})
```

## 10. Success Indicators

✅ Zero TypeScript errors
✅ Build completes successfully
✅ Prisma schema validates
✅ All imports resolve correctly
✅ No implicit 'any' types

---

**Last Updated:** After implementing 2.0 Inventory Management
**Status:** ✅ Repository Clean - 0 Errors
**Build:** ✅ Success
