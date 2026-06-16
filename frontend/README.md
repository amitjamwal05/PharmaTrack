# 🏥 PharmaTrack Frontend (Next.js)

Welcome to the frontend repository for **PharmaTrack** — an advanced, multi-tenant SaaS Pharmacy Management System.

This application is built with modern, cutting-edge web technologies to provide an incredibly fast, responsive, and beautiful user experience for both Pharmacy Admins and Cashier Staff.

## ✨ Key Features
- **Multi-Tenant Architecture**: Supports thousands of isolated pharmacies under one SaaS roof.
- **Beautiful UI**: Designed with TailwindCSS, `shadcn/ui`, and customized glassmorphism effects.
- **Advanced Dashboard Analytics**: Interactive Recharts visualizing Sales, Stock, Payment Methods, and Staff Performance.
- **Lightning-Fast POS**: A highly optimized keyboard-friendly Point of Sale (POS) screen for cashiers to quickly generate bills.
- **WhatsApp Digital Receipts**: Patients can scan a dynamically generated QR Code to download and share their digital receipts.
- **Superadmin Command Center**: A dedicated portal to monitor platform activity, subscription tiers, and churn risks across all tenants.

## 🛠️ Tech Stack
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/) & Radix Primitives
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root of the `frontend` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 4. Production Build
To create an optimized production build:
```bash
npm run build
npm start
```

## 🏗️ Project Structure
- `/src/app`: Next.js App Router pages (Dashboard, Login, Billing, Stock, etc.)
- `/src/components`: Reusable UI components, Charts, and layout shells.
- `/src/lib`: Utility functions, Axios API interceptors, and helpers.
- `/src/hooks`: Custom React hooks (e.g., `useAuth`).
