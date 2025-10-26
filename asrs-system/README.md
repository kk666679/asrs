# Automated Storage Retrieval System (ASRS)

A full-stack Next.js application for managing warehouse operations with automated storage and retrieval capabilities. This enterprise-grade system provides comprehensive inventory management, optimized picking algorithms, and real-time analytics.

https://img.shields.io/badge/ASRS-Warehouse%20Management-blue
https://img.shields.io/badge/Next.js-15.5.6-black
https://img.shields.io/badge/React-19.1.0-blue
https://img.shields.io/badge/TypeScript-5.x-blue
https://img.shields.io/badge/Prisma-6.17.1-green
https://img.shields.io/badge/PostgreSQL-Database-blue
https://img.shields.io/badge/Node.js-18+-green
https://img.shields.io/badge/License-MIT-yellow

🏗 System Architecture

High-Level System Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[Next.js App Router]
        B[React Components]
        C[TypeScript]
        D[Tailwind CSS]
    end

    subgraph "Backend Layer"
        E[Next.js API Routes]
        F[Authentication]
        G[Rate Limiting]
    end

    subgraph "Business Logic Layer"
        H[Putaway Algorithms]
        I[Picking Optimization]
        J[Inventory Management]
        K[Analytics Engine]
    end

    subgraph "Data Layer"
        L[Prisma ORM]
        M[PostgreSQL]
        N[Redis Cache]
    end

    subgraph "External Integrations"
        O[Barcode Scanners]
        P[IoT Sensors]
        Q[Robotic Systems]
        R[Supplier APIs]
    end

    A --> E
    B --> A
    E --> H
    E --> I
    E --> J
    E --> K
    H --> L
    I --> L
    J --> L
    K --> L
    L --> M
    L --> N
    E --> O
    E --> P
    E --> Q
    E --> R
```

Database Schema Architecture

```mermaid
erDiagram
    WAREHOUSE ||--o{ ZONE : contains
    WAREHOUSE ||--o{ USER : manages
    WAREHOUSE ||--o{ SHIPMENT : processes
    
    ZONE ||--o{ AISLE : contains
    ZONE {
        string id PK
        string code
        string name
        enum temperature
        enum securityLevel
        string warehouseId FK
    }
    
    AISLE ||--o{ RACK : contains
    AISLE {
        string id PK
        string code
        int number
        float width
        float height
        string zoneId FK
    }
    
    RACK ||--o{ BIN : contains
    RACK {
        string id PK
        string code
        int level
        enum orientation
        string aisleId FK
    }
    
    BIN ||--o{ BIN_ITEM : stores
    BIN {
        string id PK
        string code
        int capacity
        int currentLoad
        float weightLimit
        enum status
        string rackId FK
    }
    
    ITEM ||--o{ BIN_ITEM : stored_in
    ITEM {
        string id PK
        string sku UK
        string name
        string category
        float weight
        enum hazardLevel
        enum temperature
        int minStock
        int maxStock
        string supplierId FK
    }
    
    BIN_ITEM ||--o{ MOVEMENT : tracks
    BIN_ITEM {
        string id PK
        int quantity
        string batchNumber
        datetime expiryDate
        string binId FK
        string itemId FK
    }
    
    MOVEMENT {
        string id PK
        enum type
        int quantity
        enum status
        enum priority
        datetime timestamp
        string binItemId FK
        string fromBinId FK
        string toBinId FK
        string userId FK
    }
    
    SUPPLIER ||--o{ ITEM : supplies
    SUPPLIER ||--o{ SHIPMENT : delivers
    SUPPLIER {
        string id PK
        string code UK
        string name
        string contact
        string email
        enum status
    }
    
    SHIPMENT ||--o{ SHIPMENT_ITEM : contains
    SHIPMENT {
        string id PK
        string shipmentNumber UK
        enum type
        enum status
        datetime expectedArrival
        datetime actualArrival
        string warehouseId FK
        string supplierId FK
    }
    
    USER ||--o{ MOVEMENT : performs
    USER {
        string id PK
        string email UK
        string name
        enum role
        enum status
        string warehouseId FK
    }
```

🚀 Features

Core Functionality

· Inventory Management - Complete SKU and batch tracking
· Smart Putaway - AI-powered storage location optimization
· Order Picking - Route-optimized picking algorithms
· Real-time Tracking - Live inventory and movement monitoring
· Multi-warehouse Support - Manage multiple storage facilities

Advanced Capabilities

· Batch & Expiry Tracking - FIFO/FEFO compliance
· Temperature Control - Ambient, refrigerated, and frozen zones
· Hazardous Materials - Special handling for dangerous goods
· Supplier Management - Complete vendor and shipment tracking
· Analytics Dashboard - Inventory turnover, ABC analysis, space utilization

Industry-Specific Modules

· E-commerce Fulfillment - Batch picking, real-time updates
· Cold Chain Logistics - Temperature monitoring, compliance
· Pharmaceutical - Lot tracking, quarantine management
· Manufacturing - Raw material management, batch tracking
· 3PL Operations - Multi-client, multi-warehouse support

🛠 Tech Stack

Frontend:

· Next.js 14 with App Router
· TypeScript for type safety
· Tailwind CSS for styling
· Lucide React for icons

Backend:

· Next.js API Routes
· Prisma ORM
· PostgreSQL database
· Authentication-ready architecture

Key Dependencies:

```json
{
  "next": "14.x",
  "react": "18.x",
  "typescript": "5.x",
  "prisma": "5.x",
  "@prisma/client": "5.x",
  "lucide-react": "latest",
  "tailwindcss": "3.x"
}
```

📦 Installation

Prerequisites

· Node.js 18+
· PostgreSQL database
· npm or yarn

Setup Instructions

1. Clone the repository
   ```bash
   git clone https://github.com/your-org/asrs-system.git
   cd asrs-system
   ```
2. Install dependencies
   ```bash
   npm install
   ```
3. Environment Configuration
   Create a .env file in the root directory:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/asrs"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```
4. Database Setup
   ```bash
   npx prisma generate
   npx prisma db push
   # For production: npx prisma migrate deploy
   ```
5. Run the application
   ```bash
   npm run dev
   ```
   Open http://localhost:3000 in your browser.

📁 Project Structure

Application Structure

```mermaid
graph TD
    subgraph "Root Directory"
        A[asrs-system/]
    end

    subgraph "App Router"
        B[app/]
    end

    subgraph "API Layer"
        C[api/]
        C1[items/]
        C2[locations/]
        C3[transactions/]
        C4[putaway/]
        C5[picking/]
        C6[analytics/]
        C7[shipments/]
    end

    subgraph "UI Pages"
        D[page.tsx]
        E[items/]
        F[locations/]
        G[transactions/]
        H[analytics/]
    end

    subgraph "Components"
        I[components/]
        I1[Dashboard.tsx]
        I2[ItemManager.tsx]
        I3[StorageRetrieval.tsx]
        I4[AnalyticsDashboard.tsx]
    end

    subgraph "Data Layer"
        J[lib/]
        K[prisma/]
        L[types/]
    end

    A --> B
    B --> C
    B --> D
    B --> E
    B --> F
    B --> G
    B --> H
    A --> I
    I --> I1
    I --> I2
    I --> I3
    I --> I4
    A --> J
    A --> K
    A --> L
    C --> C1
    C --> C2
    C --> C3
    C --> C4
    C --> C5
    C --> C6
    C --> C7
```

Detailed Folder Structure

```
asrs-system/
├── app/
│   ├── api/                          # API routes
│   │   ├── items/
│   │   │   ├── route.ts              # CRUD operations for items
│   │   │   └── [id]/route.ts         # Item-specific operations
│   │   ├── locations/
│   │   │   ├── route.ts              # Storage location management
│   │   │   └── [id]/route.ts
│   │   ├── transactions/
│   │   │   └── route.ts              # Movement transactions
│   │   ├── putaway/
│   │   │   └── route.ts              # Smart putaway algorithms
│   │   ├── picking/
│   │   │   └── route.ts              # Order picking optimization
│   │   ├── analytics/
│   │   │   └── inventory/route.ts    # Inventory analytics
│   │   └── shipments/
│   │       └── route.ts              # Shipment management
│   ├── items/
│   │   ├── page.tsx                  # Items management page
│   │   └── [id]/page.tsx             # Item detail page
│   ├── locations/
│   │   └── page.tsx                  # Storage locations page
│   ├── transactions/
│   │   └── page.tsx                  # Transactions history
│   ├── analytics/
│   │   └── page.tsx                  # Analytics dashboard
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Main dashboard
├── components/                       # Reusable React components
│   ├── Dashboard.tsx                 # Main dashboard with KPIs
│   ├── ItemManager.tsx               # Inventory management
│   ├── StorageRetrieval.tsx          # Putaway and picking interface
│   ├── LocationManager.tsx           # Storage bin management
│   ├── AnalyticsDashboard.tsx        # Reporting and analytics
│   ├── ShipmentManager.tsx           # Inbound/outbound tracking
│   └── ui/                           # Base UI components
│       ├── Button.tsx
│       ├── Card.tsx
│       └── Table.tsx
├── lib/                              # Utility functions
│   ├── db.ts                         # Database configuration
│   ├── auth.ts                       # Authentication utilities
│   └── utils.ts                      # Common utilities
├── prisma/                           # Database schema and migrations
│   ├── schema.prisma                 # Main schema definition
│   └── migrations/                   # Database migrations
├── types/                            # TypeScript type definitions
│   ├── item.ts                       # Item-related types
│   ├── location.ts                   # Location types
│   └── movement.ts                   # Movement types
├── public/                           # Static assets
└── styles/                           # Global styles
    └── globals.css
```

🎯 API Endpoints

Core Endpoints

Method Endpoint Description
GET /api/items Get all inventory items
POST /api/items Create new item
GET /api/locations Get storage locations
POST /api/locations Create new location
POST /api/transactions Execute storage/retrieval

Advanced Endpoints

Method Endpoint Description
POST /api/putaway Smart putaway algorithm
POST /api/picking Generate optimized pick lists
GET /api/analytics/inventory Inventory analytics
GET /api/shipments Shipment management
POST /api/shipments Create new shipment

🔧 Configuration

Warehouse Setup

1. Define warehouse zones (ambient, refrigerated, frozen)
2. Configure aisles, racks, and bins
3. Set up temperature monitoring
4. Configure user roles and permissions

System Parameters

· Reorder points and safety stock levels
· Picking and putaway rules
· Temperature thresholds
· User access controls
· Notification settings

📊 Usage Examples

1. Receiving Goods

```typescript
// Smart putaway for new shipment
const putawayResult = await fetch('/api/putaway', {
  method: 'POST',
  body: JSON.stringify({
    itemId: 'item_123',
    quantity: 100,
    batchNumber: 'BATCH-2024-01',
    expiryDate: '2024-12-31'
  })
});
```

2. Order Picking

```typescript
// Generate optimized pick list
const pickList = await fetch('/api/picking', {
  method: 'POST',
  body: JSON.stringify({
    orderId: 'ORDER-456',
    items: [
      { itemId: 'item_123', quantity: 5 },
      { itemId: 'item_456', quantity: 10 }
    ],
    priority: 'HIGH'
  })
});
```

3. Inventory Analytics

```typescript
// Get inventory insights
const analytics = await fetch('/api/analytics/inventory?period=30d');
```

🚀 Deployment

Production Build

```bash
npm run build
npm start
```

Environment Variables for Production

```env
DATABASE_URL="postgresql://prod-user:password@prod-db:5432/asrs-prod"
NEXTAUTH_SECRET="your-production-secret"
NEXTAUTH_URL="https://your-domain.com"
```

Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

📈 Monitoring & Analytics

Key Performance Indicators

· Inventory turnover rate
· Order accuracy percentage
· Putaway and picking efficiency
· Space utilization metrics
· Stockout frequency

Built-in Reports

· ABC inventory analysis
· Slow-moving items report
· Stockout alerts
· Space utilization
· Movement history

🔒 Security Features

· Role-based access control
· API rate limiting
· SQL injection prevention
· XSS protection
· Data validation
· Audit logging

🤝 Contributing

1. Fork the repository
2. Create a feature branch (git checkout -b feature/amazing-feature)
3. Commit your changes (git commit -m 'Add amazing feature')
4. Push to the branch (git push origin feature/amazing-feature)
5. Open a Pull Request

Development Guidelines

· Follow TypeScript best practices
· Write comprehensive Prisma schemas
· Include API documentation
· Add unit tests for new features
· Update README for user-facing changes

📝 License

This project is licensed under the MIT License - see the LICENSE.md file for details.

🆘 Support

For support and questions:

· 📧 Email: support@your-company.com
· 🐛 Issues: GitHub Issues
· 📚 Documentation: Wiki

🗺 Roadmap

Phase 1 (Current)

· Basic inventory management
· Storage location management
· Simple putaway and picking

Phase 2 (Next)

· Barcode/RFID integration
· Mobile app for warehouse operations
· Advanced analytics dashboard
· Supplier portal

Phase 3 (Future)

· IoT sensor integration
· Machine learning for demand forecasting
· Robotic integration APIs
· Multi-language support
