# 🏥 PharmaTrack Backend (Node.js & Express)

Welcome to the robust API engine powering **PharmaTrack** — an advanced, multi-tenant SaaS Pharmacy Management System.

This backend provides a secure, fast, and scalable RESTful API to manage thousands of isolated pharmacies, processing high-volume billing, real-time stock deductions, and complex data aggregations.

## ✨ Key Features
- **Complete Multi-Tenancy**: Every data model (Products, Bills, Stock) is strictly isolated by `storeId`, guaranteeing data privacy.
- **JWT Authentication & Authorization**: Role-based access control separating `superadmin`, `admin`, and `staff` privileges.
- **Automated Cron Jobs**: Background tasks that run continuously to flag expiring medicines and generate alerts.
- **Secure Password Resets**: Email-based OTP generation and verification for secure password recovery.
- **High-Performance Aggregations**: Optimized MongoDB queries to instantly calculate daily revenue, payment method distributions, and churn risks.

## 🛠️ Tech Stack
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (with Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens) & bcrypt
- **Security**: Helmet, CORS
- **Task Scheduling**: node-cron

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the root of the `backend` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
EMAIL_USER=your_smtp_email
EMAIL_PASS=your_smtp_password
```

### 3. Run Development Server
Using `nodemon` for auto-reloading during development:
```bash
npm run dev
```
The server will start on `http://localhost:5000`.

### 4. Production Run
```bash
npm start
```

## 🏗️ Project Structure
- `/src/controllers`: Business logic handling API requests and responses.
- `/src/models`: Mongoose database schemas and indexing rules.
- `/src/routes`: API endpoint definitions mapped to controllers.
- `/src/middleware`: Custom middleware for JWT validation and role authorization.
- `/src/services`: Background tasks (Crons) and Email sending services.
