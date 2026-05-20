# SportsHub

SportsHub is a full-stack MVP to book and reserve sports spaces. This repository contains a .NET Core backend (API) and a React + TypeScript frontend. Initial focus: badminton court booking MVP.

Quick start — running locally

Backend (API)
- Ensure .NET Core SDK is installed.
- From repo root: cd backend
- Restore and run: dotnet restore && dotnet run
- API will listen on http://localhost:5000 (Swagger UI available at http://localhost:5000/swagger when in Development)
- SQLite DB file: backend/app.db (seeded with sample courts). Delete to reset.

Frontend (web)
- From repo root: cd frontend
- Install and start dev server: npm install && npm run dev
- Frontend dev server: http://localhost:5173

Notes
- Frontend is configured to call the backend at http://localhost:5000 and CORS is enabled for the dev origin.
- A docker-compose.yml is included for future local containerized development; Dockerfiles for services will be added.

See backend/README.md and frontend/README.md for more details.
