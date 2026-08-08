# 🚀 ASRS Backend API

> **Enterprise-grade NestJS backend** for the Automated Storage Retrieval System (ASRS), providing **RESTful APIs**, **real-time robotics control**, **AI-powered analytics**, and **blockchain integration** for fully automated warehouse operations.

---

## 🧩 Tech Stack & Features

![NestJS](https://img.shields.io/badge/NestJS-11.0.1-E0234E?logo=nestjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-3178C6?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6.18.0-2D3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?logo=postgresql)
![Autonomous Mobile Robots](https://img.shields.io/badge/AMR-Robotics-FF6B35?logo=robotframework)
![Blockchain](https://img.shields.io/badge/Blockchain-Smart%20Contracts-121D33?logo=ethereum)
![IPFS](https://img.shields.io/badge/IPFS-Decentralized%20Storage-65C2CB?logo=ipfs)
![JWT](https://img.shields.io/badge/JWT-Authentication-000000?logo=jsonwebtokens)
![Passport](https://img.shields.io/badge/Passport.js-Strategy-34E27A)
![QRCode](https://img.shields.io/badge/QRCode-Generation-000000)
![Speakeasy](https://img.shields.io/badge/Speakeasy-MFA-FF6B6B)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 📋 Overview

The ASRS Backend is a comprehensive API service built with NestJS that powers the entire warehouse management ecosystem. It provides secure, scalable endpoints for inventory management, robotic control, IoT sensor integration, and blockchain-based traceability.

### 🏗️ Architecture

```mermaid
graph TB
    subgraph "Core Modules"
        A[Auth Module - JWT/MFA]
        B[Robots Module - Control API]
        C[IPFS Module - Decentralized Storage]
        D[Blockchain Module - Smart Contracts]
    end

    subgraph "API Endpoints"
        E[Analytics API]
        F[Barcodes API]
        G[Inventory API]
        H[Robotics API]
        I[Sensors API]
    end

    subgraph "Database Layer"
        J[Prisma ORM]
        K[PostgreSQL]
        L[16+ Tables]
    end

    A --> E
    B --> H
    C --> I
    D --> F
    E --> J
    F --> J
    G --> J
    H --> J
    I --> J
    J --> K
    J --> L
```

## 🎯 Core Features

### 🔐 Authentication & Security
- **JWT-based authentication** with Passport.js strategies
- **Multi-Factor Authentication (MFA)** using Speakeasy TOTP
- **Role-Based Access Control (RBAC)** with Admin/Manager/Operator/Viewer roles
- **Secure password hashing** with bcryptjs
- **Backup codes** for MFA recovery

### 🤖 Robotics Control
- **AMR fleet management** and real-time control
- **Task scheduling** and execution monitoring
- **Robot command API** (MOVE, PICK, PLACE, SCAN)
- **Status tracking** and maintenance scheduling
- **Emergency stop protocols** and safety controls

### 📦 Inventory Management
- **Real-time stock tracking** across multiple warehouses
- **Batch and expiry management** with FIFO/FEFO compliance
- **Automated reorder points** and stock alerts
- **Multi-unit measurement** and conversion
- **Hazardous materials handling** with safety protocols

### 📊 Analytics & Reporting
- **Real-time KPI dashboards** with inventory turnover metrics
- **Space utilization heatmaps** and capacity planning
- **Movement history tracking** with audit trails
- **Custom reporting engine** with export capabilities
- **Predictive analytics integration** with TensorFlow.js

### 🌐 IoT & Sensor Integration
- **Environmental monitoring** (temperature, humidity, weight)
- **Motion detection** and security sensors
- **Real-time data streaming** with quality validation
- **Threshold-based alerts** and anomaly detection
- **Calibration tracking** and maintenance scheduling

### 🔗 Blockchain & IPFS
- **IPFS integration** for decentralized storage of documents and audit trails
- **Smart contract automation** for supply chain transactions and compliance verification
- **Blockchain-based traceability** for product lifecycle and certification management
- **Cryptographic verification** of certifications and transaction integrity
- **Digital asset tokenization** for inventory items
- **Immutable audit trails** and digital signatures for regulatory compliance
- **Distributed ledger** for audit compliance

### 📱 Barcode & QR Operations
- **QR code generation** and validation
- **Bulk scanning operations** with mobile support
- **Format standardization** and error correction
- **Integration with external systems** and hardware

### 🕌 Halal Compliance
- **Certification lifecycle tracking** for ingredients and products
- **Supplier verification** and audit trails
- **Compliance reporting** and regulatory documentation
- **Automated alerts** for expiring certifications

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── app.controller.ts          # Main application controller
│   ├── app.module.ts              # Root application module
│   ├── app.service.ts             # Main application service
│   ├── main.ts                    # Application entry point
│   ├── prisma.service.ts          # Database service
│   └── types.ts                   # Global type definitions
├── modules/
│   ├── auth/                      # Authentication module
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   └── strategies/
│   ├── robots/                    # Robotics control module
│   ├── ipfs/                      # IPFS integration module
│   └── blockchain/                # Blockchain module
├── api/                           # API endpoints
│   ├── analytics/                 # Analytics endpoints
│   ├── barcodes/                  # Barcode operations
│   ├── cross-docking/             # Cross-docking operations
│   ├── halal/                     # Halal compliance
│   ├── handling-units/            # Unit handling
│   ├── inventory/                 # Inventory management
│   ├── items/                     # Item management
│   ├── labor-management/          # Labor tracking
│   ├── locations/                 # Location management
│   ├── picking/                   # Order picking
│   ├── putaway/                   # Putaway operations
│   ├── quality-inspection/        # Quality control
│   ├── robot-commands/            # Robot command API
│   ├── robots/                    # Robot management
│   ├── sensors/                   # Sensor data
│   ├── slotting/                  # Slot optimization
│   ├── storage-management/        # Storage operations
│   ├── waves/                     # Wave planning
│   └── yard-management/           # Yard operations
├── services/                      # Business logic services
├── types/                         # TypeScript type definitions
└── prisma/
    └── schema.prisma              # Database schema (16+ tables)
```

---

## 🗄️ Database Schema

The backend uses Prisma ORM with PostgreSQL, featuring 16+ interconnected tables:

### Core Tables
- **Users** - Authentication and role management
- **Warehouses** - Multi-warehouse support
- **Zones** - Temperature and security zones
- **Aisles/Racks/Bins** - Physical storage hierarchy
- **Items** - Product catalog with specifications
- **BinItems** - Stock allocation and tracking
- **Movements** - Transaction history and audit trails

### Advanced Tables
- **Robots** - Automated equipment management
- **RobotCommands** - Command queuing and execution
- **Sensors** - IoT device monitoring
- **SensorReadings** - Environmental data collection
- **Shipments** - Inbound/outbound logistics
- **Suppliers** - Vendor management
- **Halal Certifications** - Compliance tracking

### Blockchain Tables
- **IPFS Records** - Decentralized storage references
- **Smart Contracts** - On-chain transaction logs

## ⚡ Quick Start

### Prerequisites
- Node.js 22+
- PostgreSQL database
- npm or yarn package manager

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env

# 3. Configure database connection in .env
DATABASE_URL="postgresql://username:password@localhost:5432/asrs_db"

# 4. Generate Prisma client
npx prisma generate

# 5. Run database migrations
npx prisma db push

# 6. Start development server
npm run start:dev
```

The API will be available at `http://localhost:3001`

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/asrs_db

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=1h

# MFA
MFA_ISSUER=ASRS-System

# Server
PORT=3001
NODE_ENV=development
```

---

## 🚀 API Endpoints

### Authentication
- `POST /auth/login` - User login with JWT
- `POST /auth/register` - User registration
- `POST /auth/mfa/setup` - Setup MFA
- `POST /auth/mfa/verify` - Verify MFA token
- `POST /auth/refresh` - Refresh JWT token

### Inventory Management
- `GET /items` - Get all items
- `POST /items` - Create new item
- `GET /inventory/stock` - Get current stock levels
- `POST /inventory/adjust` - Adjust inventory quantities

### Robotics Control
- `GET /api/robots` - Get all robots with filtering and pagination
- `POST /api/robots` - Create new robot
- `PUT /api/robots?id={id}` - Update robot
- `DELETE /api/robots?id={id}` - Delete robot
- `GET /api/robot-commands` - Get command queue

### IoT Sensors
- `GET /sensors` - Get all sensors
- `GET /sensors/:id/readings` - Get sensor readings
- `POST /sensors/:id/calibrate` - Calibrate sensor

### Analytics
- `GET /analytics/dashboard` - Get dashboard KPIs
- `GET /analytics/movements` - Get movement history
- `GET /analytics/utilization` - Get space utilization

### Barcodes
- `POST /barcodes/generate` - Generate barcode/QR
- `POST /barcodes/validate` - Validate barcode
- `POST /barcodes/scan` - Process scan data

### Halal Compliance
- `GET /halal/certifications` - Get certifications
- `POST /halal/certifications` - Add certification
- `GET /halal/dashboard` - Compliance dashboard

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

---

## 📦 Deployment

### Docker Deployment

```bash
# Build Docker image
docker build -t asrs-backend .

# Run container
docker run -p 3001:3001 --env-file .env asrs-backend
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm run start:prod
```

---

## 🔧 Development

### Code Style
- **ESLint** for code linting
- **Prettier** for code formatting
- **Husky** for git hooks

### Database Management
```bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev

# View database
npx prisma studio
```

### API Documentation
- Auto-generated Swagger docs available at `/api/docs`
- Postman collection available in `docs/` folder

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- Follow TypeScript best practices
- Write comprehensive unit tests
- Update documentation for API changes
- Use conventional commit messages

---

## 📊 Monitoring & Logging

- **Winston** for structured logging
- **Health checks** at `/health`
- **Metrics endpoint** at `/metrics`
- **Error tracking** with Sentry integration

---

## 🔒 Security

- **Helmet.js** for security headers
- **Rate limiting** with Express Rate Limit
- **CORS** configuration for cross-origin requests
- **Input validation** with class-validator
- **SQL injection prevention** with Prisma ORM

---

## 📚 Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [JWT.io](https://jwt.io) - JWT token debugger

---

## 📧 Support

- **Issues**: [GitHub Issues](https://github.com/your-org/asrs-system/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/asrs-system/discussions)
- **Documentation**: [Wiki](https://github.com/your-org/asrs-system/wiki)

---

## 📝 License

Licensed under the **MIT License**. See [LICENSE](../../LICENSE) for full terms.
