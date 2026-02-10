# FlexSpace — Document d’architecture, standards de développement et analyse critique

## 1) Contexte et périmètre

Ce document couvre l’architecture actuelle du POC **FlexSpace**, déployé avec :

- **Frontend** sur **Vercel** (Next.js).
- **Backend** sur **Railway** (NestJS + Prisma).
- **Base de données PostgreSQL** (Railway).

Objectifs du document :
1. Décrire l’architecture en place (logique, technique, sécurité).
2. Formaliser des **normes de programmation** adaptées au projet.
3. Formaliser des **standards de sécurité** réalistes pour une mise en production.
4. Fournir une **analyse critique** : faiblesses, risques cybersécurité, maintenabilité.
5. Proposer des améliorations priorisées (court, moyen terme).

---

## 2) Architecture actuelle (état observé)

## 2.1 Vue d’ensemble

```text
[Utilisateur Web]
    ↓ HTTPS
[Frontend Next.js (Vercel)]
    ↓ HTTPS + JWT Bearer
[Backend NestJS API (Railway)]
    ↓ Prisma ORM
[PostgreSQL (Railway)]
```

- Le backend applique un préfixe global `/api`.
- L’authentification est fondée sur JWT (bearer token).
- Les accès sont contrôlés via des guards globaux JWT + rôles.
- Le système de réservation gère les conflits, la priorité manager/admin, et un QR code signé HMAC.

## 2.2 Backend (NestJS + Prisma)

### Modules fonctionnels

- **Auth** : inscription, connexion, profil (`/auth/register`, `/auth/login`, `/auth/me`).
- **Spaces** : CRUD espaces, filtres, statistiques.
- **Reservations** : création, consultation, annulation, check de disponibilité.
- **QR** : génération et vérification d’accès via signature HMAC.
- **Prisma** : accès base PostgreSQL.

### Modèle de données principal

- `User` (rôles: `EMPLOYEE`, `MANAGER`, `ADMIN`).
- `Space` (type, capacité, horaires, soft-delete via `isActive`).
- `Reservation` (statut, créneau, QR code/signature).
- `AccessLog` (historique des vérifications QR).

### Règles métier notables

- Validation des DTO côté backend (`ValidationPipe` global avec whitelist + forbidNonWhitelisted).
- Contrôle d’accès par rôles via décorateurs + guard.
- Détection de conflits de réservation.
- Soft delete des espaces si pas de réservations actives bloquantes.

## 2.3 Frontend (Next.js)

- Application client (App Router).
- Couche API dédiée (`src/lib/api.ts`) avec `fetch`.
- Gestion auth via `AuthContext` (token et profil stockés en `localStorage`).
- JWT envoyé en header `Authorization: Bearer`.

## 2.4 Déploiement et runtime

- **Railway backend** : variables d’environnement (JWT secret, DB URL), migrations Prisma au démarrage via entrypoint.
- **Vercel frontend** : URL API configurée par `NEXT_PUBLIC_API_URL`.
- CORS backend autorise `localhost:3001`, `FRONTEND_URL`, et `*.vercel.app`.

---

## 3) Normes de programmation recommandées

## 3.1 Principes généraux

1. **Séparation claire des responsabilités**
   - Controller = transport HTTP uniquement.
   - Service = logique métier.
   - Repository/Prisma = persistance.
2. **Validation systématique des entrées** côté backend.
3. **Contrats API explicites** (DTO stricts, réponses typées, erreurs homogènes).
4. **Code orienté testabilité** (services purs, dépendances injectées).
5. **Conventions de nommage homogènes** (anglais technique cohérent pour code et payloads).

## 3.2 Standards TypeScript/NestJS

- `strict` TypeScript activé et respecté.
- DTO dédiés pour chaque endpoint (input + output si nécessaire).
- Pas d’accès direct DB dans les controllers.
- Exceptions Nest normalisées (`BadRequestException`, `ForbiddenException`, etc.).
- Middlewares/guards/interceptors documentés et testés.

## 3.3 Standards Frontend Next.js

- Isoler les appels HTTP dans un seul client API.
- Préférer un stockage token en **cookie HttpOnly** (cf. sécurité) plutôt que localStorage.
- Centraliser la gestion des erreurs API et messages utilisateurs.
- Structurer les composants par domaine (`auth`, `reservations`, `spaces`) pour réduire l’entropie.

## 3.4 Standards qualité logicielle

- ESLint + Prettier bloquants en CI.
- Seuil de couverture backend (ex: 70% min) pour services critiques.
- Tests de non-régression sur règles de conflits de réservation et rôles.
- Convention de commit (`feat|fix|refactor|docs|test|chore`).

---

## 4) Standards de sécurité cibles

## 4.1 Authentification et session

- JWT court (15–30 min) + refresh token rotatif.
- Secret JWT robuste, rotation planifiée (au moins trimestrielle).
- Éviter le stockage du token d’accès en localStorage (préférer cookie HttpOnly + SameSite).
- Vérifier systématiquement la propriété ressource (ex: génération QR uniquement propriétaire/admin).

## 4.2 API & exposition réseau

- CORS strict en production (liste blanche explicite, pas de wildcard implicite).
- Rate limiting global + par endpoint sensible (`/auth/login`, `/qr/verify`).
- Protection brute-force (backoff + verrouillage temporaire ciblé).
- Uniformiser les messages d’erreur pour éviter les fuites d’information.

## 4.3 Données et base

- Chiffrement des données en transit (TLS) et au repos (Railway).
- Sauvegardes DB régulières + tests de restauration.
- Politique de rétention pour `AccessLog` (RGPD / minimisation).
- Journalisation d’audit (qui fait quoi, quand, depuis quelle IP/user-agent).

## 4.4 Secrets et supply chain

- Secrets uniquement via variables de plateforme (Railway/Vercel), jamais en dur.
- Scan dépendances (npm audit + SCA en CI).
- Mises à jour de sécurité mensuelles.
- SBOM et traçabilité versionnée pour les releases importantes.

---

## 5) Analyse critique de l’architecture actuelle

## 5.1 Forces

1. **Architecture modulaire claire** côté backend (Auth/Spaces/Reservations/QR).
2. **Validation d’entrées backend** déjà en place (bonne base anti-injection/overposting).
3. **RBAC opérationnel** (rôles + guards globaux).
4. **Modèle de données cohérent** avec index de requêtes clés.
5. **Déploiement PaaS simple** (Railway + Vercel) permettant itération rapide.

## 5.2 Faiblesses identifiées

1. **Sécurité token côté frontend**
   - JWT stocké en `localStorage` : surface XSS accrue.

2. **Contrôle d’accès incomplet sur la génération QR**
   - TODO explicitement présent sur la vérification propriétaire/admin.
   - Risque : génération QR non autorisée si endpoint appelé avec un ID valide.

3. **CORS potentiellement permissif**
   - Acceptation `*.vercel.app` pratique en POC mais large en production.

4. **Absence de protections anti-abus visibles**
   - Pas de rate limiting ni anti-bruteforce explicite.

5. **Résilience opérationnelle limitée**
   - Peu d’éléments observables sur monitoring/alerting, traçage, SLO/SLA.

6. **Maintenabilité future**
   - Peu de traces de conventions formalisées (architecture decision records, style guide projet, politique de tests par domaine).

## 5.3 Enjeux cybersécurité spécifiques Railway/Vercel

1. **Mauvaise gestion des variables d’environnement** (fuite secrets, duplication, environnements mal isolés).
2. **Dépendance aux defaults plateforme** (headers sécurité, CORS, logs) sans hardening explicite.
3. **Chaîne CI/CD** non explicitée dans le repo visible : risque de déploiements sans quality gates.
4. **Exposition internet publique** des endpoints sensibles (`auth`, `qr/verify`) sans garde anti-abus avancée.

## 5.4 Enjeux de maintenabilité

1. Croissance fonctionnelle probable (roadmap) => besoin de conventions strictes dès maintenant.
2. Dette documentaire (docs référencées mais absentes) => connaissance implicite.
3. Risque de régression métier si règles de réservation/override non couvertes en tests intégration.

---

## 6) Plan d’amélioration réaliste (priorisé)

## Phase 1 — 0 à 30 jours (impact fort, coût modéré)

1. **Sécuriser QR génération** : contrôle propriétaire/admin obligatoire.
2. **Ajouter rate limiting** (login, verify QR, endpoints globaux).
3. **Durcir CORS prod** (origines explicites par environnement).
4. **Normaliser erreurs API** (format unique, correlation id).

## Phase 2 — 1 à 2 mois

1. **Migrer auth frontend vers cookie HttpOnly** (+ CSRF token si nécessaire).
2. **Mettre en place observabilité**
   - logs structurés,
   - métriques (latence, taux erreurs),
   - alertes (disponibilité API, erreurs auth).
3. **Renforcer CI/CD**
   - lint + tests + scan vulnérabilités obligatoires,
   - blocage déploiement en cas d’échec.

## Phase 3 — 2 à 3 mois

1. **Refresh token rotatif + révocation**.
2. **Audit trail renforcé** (actions admin/manager).
3. **Jeux de tests E2E sécurité** (authz, IDOR, brute-force).
4. **ADR (Architecture Decision Records)** pour décisions structurantes.

---

## 7) Exigences de gouvernance technique

## 7.1 Checklists PR (obligatoires)

- [ ] Endpoint protégé (auth + rôles) correctement.
- [ ] DTO validé + tests associés.
- [ ] Logs pertinents sans données sensibles.
- [ ] Aucun secret hardcodé.
- [ ] Documentation/API changelog mis à jour.

## 7.2 KPIs d’architecture recommandés

- **Sécurité** : nb vulnérabilités critiques ouvertes, MTTR sécurité.
- **Qualité** : couverture tests services critiques, taux de régressions.
- **Fiabilité** : disponibilité API, p95 latence, taux d’erreurs 5xx.
- **Maintenabilité** : lead time PR, taille moyenne PR, fréquence mise à jour dépendances.

---

## 8) Conclusion exécutive

FlexSpace repose sur une base technique saine pour un POC (modularité NestJS, RBAC, validation DTO, modèle de données cohérent). Pour passer à un niveau production robuste, les priorités sont claires : **durcir l’auth/session**, **réduire l’exposition des endpoints sensibles**, **formaliser la gouvernance qualité/sécurité**, et **améliorer l’observabilité**. Les améliorations proposées ci-dessus sont réalistes sans refonte lourde et augmentent fortement la cybersécurité et la maintenabilité.
