# FinanceSarthi 🇮🇳 | AI-Powered Personal Finance Platform

FinanceSarthi is an enterprise-grade AI-powered personal finance platform built for first-time earners, working professionals, students, and families in Tier 1, Tier 2, and Tier 3 Indian cities.

---

## 🌟 Key Features

1. **AI Financial Health Engine**: Computes a dynamic **0–1000 Health Score** based on Savings Ratio, Emergency Coverage, Debt-to-Income (DTI), and Investment Ratio.
2. **Salary & Indian Tax Planner**: Side-by-side comparison of **New vs Old Tax Regimes** (FY 2024-25 / 25-26 rules) with standard deduction, Section 80C, 80D, 80CCD, and HRA exemptions.
3. **50-30-20 City Tier Allocator**: Custom budget recommendations tailored for Tier 1 Metro, Tier 2, and Tier 3 cost-of-living realities.
4. **Expense & Subscription Detector**: Log transactions, view category distribution pie charts, and auto-detect recurring OTT / utility subscriptions with overspending alerts.
5. **Multi-Horizon Goal Tracker**: Goals for Emergency Safety Fund, Electric Vehicle, House, Vacation, Marriage, Education, and Retirement with target completion predictors.
6. **Decision Hub (Calculators)**: SIP (with annual step-up growth), EMI Amortization, FD Quarterly Compounding, and **Loan Prepayment vs SIP Equity Investment Strategy Analyzer**.
7. **Net Worth Portfolio Aggregator**: Track bank accounts, Zerodha mutual funds, EPF/VPF, Gold, Real Estate, and outstanding loans over time.
8. **AI Sarthi Conversational Coach**: Context-aware AI chatbot powered by Google Gemini API with pre-built financial prompt chips and memory.
9. **Finance Academy & Gamification**: Interactive courses, finance quizzes, XP points, unlockable badges, and downloadable certificates.

---

## 🏗️ Architecture & Monorepo Layout

```
FinanceSarthi/
├── apps/
│   ├── web/                # React 19 + Vite + Tailwind v4 + Recharts + Framer Motion
│   ├── backend/            # Express.js + Prisma ORM + JWT + Controller-Service-Repository
│   └── ai-service/         # Python FastAPI + Google Gemini API + Rule Engine
├── packages/
│   ├── types/              # Domain interfaces & TypeScript contracts
│   ├── utils/              # Indian Tax, SIP, EMI, Health Score algorithms
│   ├── ui/                 # Shared UI primitives
│   └── config/             # Shared ESLint/TS configs
├── docker/                 # Dockerfiles & Nginx reverse proxy
├── .github/workflows/      # CI/CD pipeline
└── docker-compose.yml
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js >= 20
- Python >= 3.11
- Docker & Docker Compose (Optional)

### Installation

```bash
# 1. Clone workspace & install dependencies
npm install

# 2. Run Python AI Microservice (Terminal 1)
cd apps/ai-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# 3. Run Express Backend (Terminal 2)
cd apps/backend
npm run dev

# 4. Run React 19 Web App (Terminal 3)
cd apps/web
npm run dev
```

Visit the app at **http://localhost:3000**!

---

## 🐳 Docker Deployment

```bash
# Build and orchestrate all services
docker-compose up --build
```

---

## 🛡️ Security & Engineering Standards
- **REST APIs**: Versioned under `/api/v1`
- **Security Headers**: Helmet, CORS isolation, rate limiting
- **Design System**: Modern Glassmorphism, Emerald/Slate palette, dark mode theme
- **Code Quality**: TypeScript strict mode, clean modular architecture
