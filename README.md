
# 🏢 FlexSpace - POC SaaS de réservation d'espaces

POC d'une application de gestion d'espaces flex office avec authentification multi-rôles, réservation avec détection de conflits, et contrôle d'accès via QR code.

## 🌐 Déploiements

-   **Frontend (Vercel)**: [https://flexspace-saas-poc-website.vercel.app/](https://flexspace-poc.vercel.app/)
    
-   **Backend API (Railway)**: [https://flexspace-saas-poc-production.up.railway.app/api](https://flexspace-api.up.railway.app/api)
    
-   **Healthcheck**: [https://flexspace-saas-poc-production.up.railway.app/api/health](https://flexspace-api.up.railway.app/api/health)
    

## ✅ Fonctionnalités réellement présentes dans le code

-   Authentification JWT (register/login/me)
    
-   Rôles: `EMPLOYEE`, `MANAGER`, `ADMIN`
    
-   CRUD des espaces (admin)
    
-   Recherche et filtres d'espaces (public)
    
-   Réservations avec détection de conflits
    
-   Override de conflit pour manager/admin
    
-   Vérification de disponibilité
    
-   Annulation de réservation
    
-   Génération et vérification QR code signé (HMAC)
    
-   Logs d'accès QR
    

> Note: les analytics avancées (top spaces/heures de pointe) et certaines features roadmap ne sont pas encore implémentées.

## 🛠️ Stack technique

### Backend

-   **NestJS 11**
    
-   **TypeScript**
    
-   **Prisma 5**
    
-   **PostgreSQL 15**
    
-   **JWT + bcrypt**
    
-   **class-validator / class-transformer**
    

### Frontend

-   **Next.js 16 (App Router)**
    
-   **React 19**
    
-   **Tailwind CSS 4**
    
-   **shadcn/ui (Radix UI)**
    

### Infra / DevOps

-   **Backend hosting**: Railway
    
-   **Frontend hosting**: Vercel
    
-   **Base de données**: PostgreSQL Railway
    
-   **Container local backend**: Dockerfile + docker-compose
    

## 🚀 Lancer le projet en local

## 1) Prérequis

-   PostgreSQL 15+ (ou docker-compose)
    

## 2) Backend

```bash
cd backend
npm install
cp .env.example .env

# applique les migrations
npx prisma migrate dev

# démarre l'API
npm run start:dev
# API: http://localhost:3000/api
```

## 3) Frontend

```bash
cd frontend
npm install
cp .env.example .env.local

# démarre l'app sur 3001 (pour éviter le conflit avec le backend)
npm run dev -- -p 3001
# Front: http://localhost:3001
```

## 4) Option docker-compose (backend + postgres)

```bash
docker compose up --build
```

## 📚 Documentation projet

-   [Architecture + standards + analyse critique (FR)](docs/architecture-security-review.md)
    
-   [Planning de développement reconstitué (6 jours)](docs/planning-6-jours.md)

-   [Diagramme Entité-Relation](docs/ERDFlexSpace.drawio.png)

-   [Diagramme C4 niveau 1](docs/C4FlexSpaceLVL1.drawio.png)
    
-   [Diagramme C4 niveau 2](docs/C4FlexSpaceLVL2.drawio.png)

-   [Diagramme de séquence - Création de réservation](docs/SequenceDiagram1CreateReservation.png)

-   [Diagramme de séquence - Vérification d'accès QR](docs/SequenceDiagram2VerifyQRAccess.png)

-   [Diagramme de séquence - Outrepassement de réservation par manager](docs/SequenceDiagram3ManagerOverride.png)

## 🧪 Vérifications utiles

### Backend

```bash
cd backend
npm run test
npm run test:e2e
```

### Frontend

```bash
cd frontend
npm run lint
npm run build
```

## 🔐 Sécurité (état actuel)

Déjà en place:

-   Hash bcrypt des mots de passe
    
-   JWT signé avec expiration
    
-   Validation stricte des DTO (whitelist + forbidNonWhitelisted)
    
-   Contrôle d'accès par rôles (guards)
    
-   CORS configuré
    

Points à renforcer (POC):

-   Rate limiting (login / qr/verify)
    
-   Stockage token frontend (préférer cookie HttpOnly au localStorage)
    
-   Durcissement CORS production (allowlist stricte)
    
-   Contrôle d'autorisation explicite sur génération QR (propriétaire/admin)
    

## 🗺️ Roadmap indicative

-   Notifications (email/SMS)
    
-   Réservations récurrentes
    
-   Workflow d'approbation manager
    
-   Intégration calendriers (Google/Outlook)
    
-   Observabilité avancée (logs/metrics/alerting)
    

## 👤 Auteur

**Anthony Bauchet**

GitHub: [@ChocoTouch](https://github.com/ChocoTouch)