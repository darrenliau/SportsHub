# SportsHub — Implementation Plan

Problem statement
- Build a mobile/web app to book and reserve sports spaces. First MVP: badminton court bookings.
- Two views: Operator dashboard (view/manage bookings) and Customer site (browse courts, pick timeslots, book).

Technology stack
- Frontend: React + TypeScript (TSX). Responsive web and mobile-web first; later wrap in React Native if needed.
- Backend: .NET Core Web API with Entity Framework Core.
- Database: SQLite for initial MVP (cheap, zero-admin, supported by EF Core). Option to migrate to PostgreSQL for production.

High-level architecture
- Backend: .NET Web API project with EF Core models: Court, Timeslot, Booking, User (operator/customer). Expose REST endpoints for availability, bookings, admin management.
- Frontend: React app (CRA/Vite) with routes: / (search), /book, /dashboard. Customer booking flow and operator dashboard.
- Auth: Simple email-password or token-based for operators; customers can book with minimal signup (email/phone).
- Deployment: Docker images for API and static frontend. Use lightweight hosting (DigitalOcean, Render, Railway). SQLite stored in container volume or use managed DB when scaling.

MVP scope (in/out)
- In scope: court/time selection, create/cancel bookings, operator view of bookings, basic validation (no double-book), persistence with EF Core + SQLite.
- Out of scope for MVP: payments, advanced availability rules, multi-venue multi-sport (can be added later).

Todos
- scaffold-repo: Initialize repository, folders: /backend, /frontend, README, LICENSE
- backend-scaffold: Create .NET 8 Web API project, add EF Core and SQLite provider, setup Dockerfile
- backend-booking-model: Implement models (Court, Timeslot, Booking, User), configure DbContext, add migrations
- backend-api-endpoints: Implement REST endpoints (GET /courts, GET /availability, POST /bookings, GET /bookings)
- frontend-scaffold: Create React + TypeScript app (Vite or CRA), setup routing and basic layout
- frontend-booking-ui: Implement court listing, timeslot picker, booking form, confirmation flow
- frontend-dashboard: Implement operator dashboard to view and filter bookings
- auth: Add simple auth for operator/admin and optional customer signup
- tests: Add unit tests for booking validation and API contracts
- deploy-setup: Docker Compose for local dev, basic deployment manifest

Notes and decisions
- Use SQLite for cheapest, simplest start. EF Core makes switching to Postgres simple later.
- Design database with Court and Timeslot so timeslots are queryable for availability; avoid heavy locking by using transactional booking insert with uniqueness constraints.

Next step
- Confirm scope and DB choice, then scaffold backend + frontend.
