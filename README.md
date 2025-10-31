# 🚀 Automated Storage Retrieval System (ASRS)

> **Enterprise-grade full-stack warehouse automation platform** built with **Next.js**, **Prisma**, **PostgreSQL**, **TensorFlow.js**, and **IoT/Robotics integration**.
> ASRS provides **AI-powered inventory optimization**, **real-time analytics**, **predictive demand forecasting**, and **robotic control** for fully automated warehouse operations.

---

## 🧩 Tech Stack & Platform Badges

![Next.js](https://img.shields.io/badge/Next.js-15.5.6-black?logo=nextdotjs)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC?logo=tailwindcss)
![NestJS](https://img.shields.io/badge/NestJS-11.0.1-E0234E?logo=nestjs)
![Prisma](https://img.shields.io/badge/Prisma-6.18.0-2D3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?logo=postgresql)
![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-4.22.0-FF6F00?logo=tensorflow)
![Autonomous Mobile Robots](https://img.shields.io/badge/AMR-Robotics-FF6B35?logo=robotframework)
![Blockchain](https://img.shields.io/badge/Blockchain-Smart%20Contracts-121D33?logo=ethereum)
![IPFS](https://img.shields.io/badge/IPFS-Decentralized%20Storage-65C2CB?logo=ipfs)
![Node.js](https://img.shields.io/badge/Node.js-22+-339933?logo=node.js)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?logo=docker)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)
![AWS](https://img.shields.io/badge/Compatible%20with-AWS-FF9900?logo=amazon-aws)
![Railway](https://img.shields.io/badge/Deployable%20on-Railway-0B0D0E?logo=railway)
![GitHub](https://img.shields.io/badge/Version%20Control-GitHub-181717?logo=github)
![License](https://img.shields.io/badge/License-MIT-yellow)
![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)

---

## 🏗️ System Overview

ASRS integrates **AI-driven logistics**, **IoT monitoring**, and **robotic automation** in a modular architecture.

### 🧱 High-Level Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[Next.js + React + TypeScript + TailwindCSS]
    end

    subgraph "Backend Layer"
        B[NestJS API + Authentication]
        C[TensorFlow.js Forecasting]
        D[Prisma ORM + PostgreSQL]
        E[Blockchain Smart Contract/IPFS Integration]
    end

    subgraph "Integration Layer"
        F[IoT Sensors & Robotics]
        G[Barcode/QR/RFID Systems]
        H[Supplier APIs]
        I[External Systems]
    end

    subgraph "Analytics & AI"
        J[AI Models + Predictive Dashboards]
        K[Real-time Monitoring]
    end

    A --> B
    B --> D
    B --> E
    B --> F
    B --> G
    B --> H
    B --> I
    D --> J
    E --> J
    F --> K
    J --> K
```

---

## 💡 Core Features

### 🏷 Inventory & Warehouse Management

* Full SKU, batch, and expiry tracking
* **Autonomous Mobile Robots (AMR)** fleet management and control
* Real-time AMR monitoring, task assignment, and route optimization
* Battery level tracking and automated charging station management
* AMR status monitoring (idle, moving, charging, error, maintenance)
* Interactive warehouse map with AMR position visualization
* Fleet-wide command controls (start, pause, emergency stop)
* Real-time updates with automated reconciliation
* Multi-unit and multi-warehouse support
* Reorder point automation and stock alerts

### ⚙️ AI-Powered Optimization

* **Smart Putaway:** AI algorithms optimize storage locations for space and efficiency
* **Order Picking:** Genetic routing for minimal travel paths
* **Demand Forecasting:** TensorFlow.js-based predictive analysis

### 📡 IoT & Robotics Integration

* Live temperature, humidity, and weight monitoring
* Integration with industrial sensors and PLC systems
* Robotic control via API commands (path planning, collision avoidance)

### 🧠 Predictive Analytics

* Demand forecasting and capacity planning
* ABC classification, space utilization heatmaps
* Automated KPI dashboards with anomaly detection

### 📦 Barcode & QR Operations

* Barcode/QR/RFID code generation, validation, and scanning
* Mobile-friendly interface with **HTML5 QR Code API**
* Bulk operations for inbound/outbound logistics

### 🕌 Halal & Regulatory Compliance

* Halal certification lifecycle tracking
* Regulatory compliance (HACCP, FDA, GMP, OSHA)
* Supplier certification verification, documentation and smart contract

### ⛓️ Smart Contracts & IPFS Integration

* **Decentralized storage** for immutable audit trails and documents
* **Smart contract automation** for supply chain transactions and compliance
* **Blockchain-based traceability** for product lifecycle management
* **Cryptographic verification** of certifications and transactions
* **IPFS file storage** for secure document management

---

## 🧰 Advanced Modules

| Module                        | Description                                      |
| ----------------------------- | ------------------------------------------------ |
| **E-commerce Fulfillment**    | Multi-order batch picking, live order sync       |
| **Cold Chain Logistics**      | Temperature-controlled zone management           |
| **Pharmaceutical Tracking**   | Lot quarantine, serialization, and expiry        |
| **Manufacturing Integration** | Raw material flow and JIT operations             |
| **3PL & Multi-tenant**        | Multi-client operations with billing & analytics |

---

## 🛠 Tech Stack

| Layer               | Technology                                              |
| ------------------- | ------------------------------------------------------- |
| **Frontend**        | Next.js 15, React 19, TypeScript 5, TailwindCSS 4       |
| **Backend**         | NestJS 11, Prisma ORM, PostgreSQL, JWT Authentication  |
| **AI/ML**           | TensorFlow.js (Demand Forecasting, Optimization)        |
| **Blockchain**      | IPFS Integration, Smart Contracts                       |
| **IoT Integration** | HTML5 QR Code, Sensor APIs, Robotic Control             |
| **Cloud**           | Vercel, AWS, Railway, Docker                            |
| **Analytics**       | Recharts, Lucide, Custom KPI Engine                     |

---

## ⚡ Quick Start

```bash
# 1. Clone repository
git clone https://github.com/your-org/asrs-system.git
cd asrs-system

# 2. Install frontend dependencies
npm install

# 3. Install backend dependencies
cd backend
npm install
cd ..

# 4. Setup environment files
cp .env.example .env.local
cp backend/.env.example backend/.env

# 5. Initialize databases
npx prisma generate
npx prisma db push

# 6. Run backend server (in one terminal)
cd backend
npm run start:dev

# 7. Run frontend server (in another terminal)
cd ..
npm run dev
```

🖥️ Frontend → [http://localhost:3000](http://localhost:3000)  
🔧 Backend API → [http://localhost:3001](http://localhost:3001)

---

## 📦 Deployment

### 🚀 Vercel (Recommended)

```bash
vercel --prod
```

### 🐳 Docker

```bash
docker build -t asrs-system .
docker run -p 3000:3000 asrs-system
```

### ☁️ AWS / Railway

* Connect PostgreSQL instance
* Add environment variables
* Deploy containerized image

---

## 🔐 Security & Compliance

* **NextAuth.js** with secure JWT sessions
* **RBAC (Role-Based Access Control)** for user privileges
* **Zod Validation** for API payload integrity
* **Encrypted Database Storage**
* **GDPR, ISO27001, and SOC2 ready**

---

## 📈 Monitoring & KPIs

* Inventory Turnover
* Picking Accuracy
* Space Utilization
* Robot Efficiency
* Demand Forecast Accuracy
* Temperature & Sensor Reliability

📊 Integrated dashboards visualize **operational, predictive, and maintenance KPIs** in real time.

---

## 🧠 AI & Machine Learning Capabilities

| Feature                        | Model                      |
| ------------------------------ | -------------------------- |
| **Demand Forecasting**         | TensorFlow.js RNN          |
| **Putaway Optimization**       | Reinforcement Learning     |
| **Picking Route Optimization** | Genetic Algorithm          |
| **Anomaly Detection**          | Autoencoder-based          |
| **Predictive Maintenance**     | Regression-based ML models |

---

## 🗺 Roadmap

| Phase                             | Focus                                  | Status         |
| --------------------------------- | -------------------------------------- | -------------- |
| **1. Core Platform**              | Inventory, Picking, Putaway, Analytics | ✅ Complete     |
| **2. Automation Layer**           | Robotics, IoT, Forecasting             | ✅ Complete     |
| **3. Mobile App & AR**            | Handheld UI, Voice Commands            | 🚧 In Progress |
| **4. ERP/Blockchain Integration** | SAP, Oracle, Traceability              | 🔮 Planned     |

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch
3. Submit a PR following [Conventional Commits](https://.org/)
4. Add unit tests and update documentation

```bash
git checkout -b feat/new-feature
npm run test
npm run build
git push origin feat/new-feature
```

---

## 📚 Documentation & Support

* 📘 **Docs:** [Wiki](https://github.com/your-org/asrs-system/wiki)
* 🐛 **Issues:** [GitHub Issues](https://github.com/your-org/asrs-system/issues)
* 💬 **Community:** [Discussions](https://github.com/your-org/asrs-system/discussions)
* 📧 **Support:** [support@your-company.com](mailto:support@your-company.com)

---

## 📝 License

Licensed under the **MIT License**.
See [LICENSE.md](LICENSE.md) for full terms.