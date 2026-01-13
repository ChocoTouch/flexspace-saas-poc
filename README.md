
# 🏢 FlexSpace - Intelligent Workspace Booking System

POC d'un SaaS de gestion d'espaces flex office avec réservation intelligente et contrôle d'accès QR Code.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- npm ou yarn

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Éditez .env avec vos credentials
npx prisma migrate dev
npm run start:dev
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

## 📚 Documentation
- [Architecture](./docs/architecture.md)
- [API Reference](./docs/api.md)
- [Deployment](./docs/deployment.md)

## 🛠️ Tech Stack
**Backend**: NestJS, Prisma, PostgreSQL
**Frontend**: Next.js 14, TailwindCSS, shadcn/ui
**DevOps**: GitHub Actions, Railway, Vercel

## 📝 License
MIT
