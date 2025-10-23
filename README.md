# 0000-fsams-redvalley-clinicalplatform
Red Valley Test

## Arquitectura:
┌─────────────────┐    HTTP/REST     ┌─────────────────┐    SQL/Queries    ┌─────────────────┐
│   FRONTEND      │ ───────────────► │   BACKEND API   │ ────────────────► │   BASE DE DATOS  │
│   (React)       │                  │   (Express)     │                   │   (MySQL)        │
│                 │ ◄─────────────── │                 │ ◄──────────────── │                 │
│ • TanStack Query│                  │ • Endpoints     │                   │ • Tablas         │
│ • Axios/fetch   │                  │ • Sequelize     │                   │ • Datos crudos   │
└─────────────────┘                  └─────────────────┘                   └─────────────────┘

## Requisitos
- Node 18+ (recomendado 20)
- Docker Desktop (Compose v2)

## Setup
```bash
# 1) levantar MySQL
docker compose up -d

# 2) instalar deps
npm i

# 3) migraciones + seeds
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all

# 4) serve (Nx)
npx nx serve api
```

## ENV (.env en la raíz)

``` ini
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=clinical_platform
DB_USER=clinical_user
DB_PASS=clinical_pass
```

## Endpoints
- GET /health
- GET /statuses
- GET /statuses/tree
- GET /providers
- POST /patients
- GET /patients
- GET /patients/:id
- POST /patients/:id/assign-provider
- POST /patients/:id/change-status
- GET /patients/:id/history