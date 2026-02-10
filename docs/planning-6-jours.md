# Planning de développement (6 jours)

## Jour 1 — Cadrage + initialisation technique

- Cadrage fonctionnel POC (utilisateurs, espaces, réservations, QR)
- Choix architecture: Next.js (front) + NestJS (API) + PostgreSQL
- Initialisation des repositories backend/frontend
- Mise en place Prisma + premier schéma de données
- Setup environnement local et scripts npm

**Livrables**
- Projet exécutable localement
- Schéma de base (User/Space/Reservation/AccessLog)

## Jour 2 — Authentification et contrôle d'accès

- Implémentation auth backend (register/login/me)
- JWT strategy + guards globaux
- Mise en place rôles (`EMPLOYEE`, `MANAGER`, `ADMIN`)
- Formulaires login/register côté front
- Gestion de session côté front (context + token)

**Livrables**
- Flux d'auth complet front↔back
- Accès API protégé selon rôle

## Jour 3 — Module Espaces (front + back)

- Endpoints backend espaces (CRUD + filtres)
- Validation DTO et règles métier (horaires/capacité)
- UI liste des espaces + détail + parcours admin
- Gestion erreurs API côté front

**Livrables**
- Gestion des espaces opérationnelle
- Base de sécurité rôle admin pour mutations

## Jour 4 — Module Réservations et détection de conflits

- Création réservation avec contraintes temporelles
- Détection de conflits de créneaux
- Règle d'override pour manager/admin
- Endpoints listing/annulation/check disponibilité
- Écrans front de réservation + "mes réservations"

**Livrables**
- Parcours réservation bout-en-bout
- Règles métier de conflits en place

## Jour 5 — QR code, contrôle d'accès, stabilisation

- Génération QR signé (HMAC)
- Vérification QR et journalisation des accès
- Durcissement validations et cas d'erreur
- Ajustements UX et messages d'erreur
- Tests unitaires ciblés sur services critiques

**Livrables**
- Contrôle d'accès QR fonctionnel
- Traçabilité minimale des scans

## Jour 6 — Déploiement, recette et documentation

- Déploiement backend sur Railway
- Déploiement frontend sur Vercel
- Configuration variables d'environnement
- Corrections de connectivité (CORS, URL API)
- Recette finale POC + documentation projet

**Livrables**
- Démo en ligne front/back
- Base documentaire d'architecture et d'exploitation

---

## Risques assumés (normaux sur un POC 6 jours)

- Sécurité avancée partielle (rate limiting, refresh tokens, hardening approfondi)
- Couverture de tests incomplète
- Documentation initiale non exhaustive (améliorée ensuite)