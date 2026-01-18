# 🏢 FlexSpace - Intelligent Workspace Booking System

[![Backend CI](https://github.com/[USER]/flexspace-saas-poc/workflows/Backend%20CI%2FCD/badge.svg)](https://github.com/[USER]/flexspace-saas-poc/actions)
[![Frontend CI](https://github.com/[USER]/flexspace-saas-poc/workflows/Frontend%20CI%2FCD/badge.svg)](https://github.com/[USER]/flexspace-saas-poc/actions)

POC d'un SaaS de gestion d'espaces flex office avec réservation intelligente, détection de conflits, et contrôle d'accès via QR Code.

## 🌐 Live Demo

- **Frontend**: https://flexspace-poc.vercel.app
- **Backend API**: https://flexspace-api.up.railway.app/api
- **API Health**: https://flexspace-api.up.railway.app/api/health

## 🎯 Fonctionnalités (POC)

- ✅ Authentification multi-rôles (Employee, Manager, Admin)
- ✅ Gestion des espaces (CRUD)
- ✅ Réservation avec détection de conflits automatique
- ✅ Priorité manager (override)
- ✅ Génération QR Code sécurisé (HMAC-SHA256)
- ✅ Vérification accès en temps réel
- ✅ Analytics : taux d'occupation, top spaces, heures de pointe

## 🛠️ Tech Stack

### Backend
- **Framework**: NestJS 10 (TypeScript)
- **ORM**: Prisma 5
- **Database**: PostgreSQL 15
- **Auth**: JWT + bcrypt
- **Validation**: class-validator

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI**: TailwindCSS + shadcn/ui
- **State**: React Context + TanStack Query (à venir)
- **Charts**: Recharts (à venir)

### DevOps
- **Backend Hosting**: Railway
- **Frontend Hosting**: Vercel
- **CI/CD**: GitHub Actions
- **Database**: Railway PostgreSQL

## 🚀 Installation Locale

### Prérequis
- Node.js 20+
- PostgreSQL 15+ (ou Docker)
- npm

### 1. Cloner le repo
```bash
git clone https://github.com/[USER]/flexspace-saas-poc.git
cd flexspace-saas-poc
```

### 2. Backend
```bash
cd backend
npm install

# Copier et configurer .env
cp .env.example .env
# Éditez .env avec vos credentials PostgreSQL

# Appliquer migrations
npx prisma migrate dev

# Lancer en dev
npm run start:dev
# API accessible sur http://localhost:3000/api
```

### 3. Frontend
```bash
cd ../frontend
npm install

# Copier et configurer .env
cp .env.example .env.local

# Lancer en dev
npm run dev
# App accessible sur http://localhost:3001
```

## 📚 Documentation

- [Architecture Diagram](./docs/architecture.md)
- [API Reference](./docs/api.md)
- [Database Schema](./backend/prisma/schema.prisma)
- [Deployment Guide](./docs/deployment.md)

## 🧪 Tests

### Backend
```bash
cd backend
npm run test          # Unit tests
npm run test:e2e      # E2E tests
npm run test:cov      # Coverage
```

### Frontend
```bash
cd frontend
npm run lint
npm run build         # Test build
```

## 🔐 Sécurité

- ✅ Passwords hashed avec bcrypt (10 rounds)
- ✅ JWT avec expiration 24h
- ✅ QR Code signé HMAC-SHA256
- ✅ CORS configuré
- ✅ Input validation (class-validator)
- ✅ HTTPS enforced (production)

**Vulnérabilités connues (POC)** :
- ⚠️ Pas de rate limiting
- ⚠️ Pas de MFA
- ⚠️ QR Code peut être partagé (pas de one-time use)

Voir [docs/security.md](./docs/security.md) pour détails.

## 📊 Architecture

### C4 - Containers
```
[User] → [Next.js App (Vercel)]
           ↓ HTTPS/JWT
       [NestJS API (Railway)]
           ↓ Prisma
       [PostgreSQL (Railway)]
```

Diagrammes complets : [docs/architecture.md](./docs/architecture.md)

## 🗺️ Roadmap

### Q1 2026 (Post-POC)
- [ ] Intégration calendrier (Google/Outlook)
- [ ] Notifications email/SMS
- [ ] Réservations récurrentes
- [ ] Mobile app (React Native)

### Q2 2026
- [ ] Réservations en équipe
- [ ] Workflow approbation manager
- [ ] Gestion visiteurs temporaires
- [ ] Analytics ML (prédictions)

Roadmap complète : [docs/roadmap.md](./docs/roadmap.md)

## 🤝 Contribution

Les contributions sont bienvenues ! 

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/amazing-feature`)
3. Commit vos changements (`git commit -m 'feat: add amazing feature'`)
4. Push sur la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

## 📝 License

MIT License - voir [LICENSE](LICENSE)

## 👤 Auteur

**[Anthony Bauchet]**
- GitHub: [@ChocoTouch](https://github.com/ChocoTouch)

---