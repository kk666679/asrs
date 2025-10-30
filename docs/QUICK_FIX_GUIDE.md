# Quick Fix Guide - ASRS Repository

## Current Status
- ✅ **111 errors fixed** (53% reduction)
- ⚠️ **98 errors remaining**
- 🎯 **Target: 0 errors**

## Quick Commands

### Check Errors
```bash
# Count total errors
npx tsc --noEmit 2>&1 | grep "error TS" | wc -l

# See error summary
npx tsc --noEmit 2>&1 | grep "error TS" | head -20

# Try build
npm run build
```

### Common Fixes

#### 1. Fix Prisma Model Names
```bash
# In any file, replace:
prisma.item     → prisma.items
prisma.bin      → prisma.bins
prisma.movement → prisma.movements
prisma.robot    → prisma.robots
prisma.sensor   → prisma.sensors
```

#### 2. Fix Relation Names
```typescript
// In include statements:
include: {
  supplier: true    // ❌ Wrong
  suppliers: true   // ✅ Correct
}
```

#### 3. Fix Response Type Guards
```typescript
// Before:
const data = response.ok ? await response.json() : null;

// After:
const data = response.ok && 'json' in response ? await response.json() : null;
```

#### 4. Fix Index Signatures
```typescript
// Before:
const map = { HIGH: 3, MEDIUM: 2, LOW: 1 };
map[key] // Error!

// After:
const map: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
map[key] // ✅ Works
```

## Files to Fix Next

### Priority 1: Backend (33 errors)
```
backend/src/services/robotics.ts (18 errors)
backend/src/modules/robots/robots.controller.ts (15 errors)
```

### Priority 2: Seed Files (29 errors)
```
prisma/seed.ts (17 errors)
prisma/mock-data.ts (12 errors)
```

### Priority 3: Libraries (27 errors)
```
lib/services/alerting.ts (11 errors)
lib/algorithms/putaway.ts (11 errors)
lib/algorithms/picking.ts (10 errors)
```

## Automated Fix Script

```bash
# Run this to fix most Prisma model name errors:
find . -name "*.ts" -type f -not -path "*/node_modules/*" -exec sed -i \
  's/prisma\.item\b/prisma.items/g; \
   s/prisma\.bin\b/prisma.bins/g; \
   s/prisma\.movement\b/prisma.movements/g; \
   s/prisma\.robot\b/prisma.robots/g; \
   s/prisma\.sensor\b/prisma.sensors/g; \
   s/prisma\.zone\b/prisma.zones/g' {} \;
```

## Common Error Patterns

### TS2551: Property does not exist
```typescript
// Error: Property 'item' does not exist on type 'PrismaClient'
await prisma.item.findMany()  // ❌

// Fix: Use plural form
await prisma.items.findMany() // ✅
```

### TS2322: Type assignment error
```typescript
// Error: Type '{ sku: any; ... }' is not assignable
await prisma.items.create({
  data: { sku, name, category }  // ❌ Missing required fields
})

// Fix: Include all required fields
await prisma.items.create({
  data: { 
    sku, 
    name, 
    category,
    weight: 0,
    hazardLevel: 'NONE',
    temperature: 'AMBIENT',
    minStock: 0,
    supplierId: 'xxx'
  }
})
```

### TS7006: Implicit 'any' type
```typescript
// Error: Parameter 'item' implicitly has an 'any' type
items.map(item => item.name)  // ❌

// Fix: Add type annotation
items.map((item: Item) => item.name)  // ✅
```

## Testing After Fixes

```bash
# 1. Check TypeScript
npx tsc --noEmit

# 2. Validate Prisma
npx prisma validate

# 3. Try build
npm run build

# 4. Run dev server
npm run dev
```

## Documentation

- 📄 **ERROR_FIX_REPORT.md** - Detailed technical analysis
- 📄 **FIX_SUMMARY.md** - Executive summary with charts
- 📄 **This file** - Quick reference guide

## Need Help?

1. Check the error message carefully
2. Look for similar fixes in already-fixed files
3. Refer to Prisma schema for correct model names
4. Use the automated fix scripts above
5. Test incrementally after each fix

---

**Last Updated:** After fixing 111 errors  
**Status:** 53% complete, 98 errors remaining
