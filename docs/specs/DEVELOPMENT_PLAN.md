# DEVELOPMENT PLAN: test Dennis

## 1. ARCHITECTURE OVERVIEW

**Components:**
- **Frontend (React 18 + TypeScript + Vite):**
  - User authentication (login)
  - Dashboard: list/filter prospectos y oportunidades
  - Oportunidad detail: historial de interacciones, tareas, formulario de edición
  - Registro de prospectos, oportunidades, interacciones, tareas
  - Calendario de actividades (interacciones y tareas)
- **Backend (Node.js + Express + TypeScript):**
  - **auth-service** (puerto 8001): login, user info (JWT)
  - **opportunity-service** (puerto 8002): CRUD de oportunidades y prospectos
  - **interaction-service** (puerto 8003): CRUD de interacciones y tareas
  - **shared**: tipos, utilidades, conexión DB, JWT, Redis
- **Database:** PostgreSQL 15.x (con tablas: user, prospect, opportunity, interaction, task)
- **Cache:** Redis 7.x (para JWT, caching)
- **Infraestructura:** Docker, docker-compose, Railway/Render

**APIs y Endpoints:**
- `/api/auth/login`, `/api/auth/me`
- `/api/opportunities`, `/api/opportunities/:id`
- `/api/interactions`, `/api/interactions?opportunityId=...`
- (Tareas y prospectos: gestionados en endpoints de oportunidades/interacciones según el SPEC.md y requerimientos)

**Folder Structure (según SPEC.md):**
```
.
├── docker-compose.yml
├── .env.example
├── .gitignore
├── README.md
├── run.sh
├── frontend/
│   ├── Dockerfile
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── api/
│       │   ├── auth.ts
│       │   ├── opportunities.ts
│       │   └── interactions.ts
│       ├── hooks/
│       │   ├── useAuth.ts
│       │   ├── useOpportunities.ts
│       │   └── useInteractions.ts
│       ├── components/
│       │   ├── OpportunityList.tsx
│       │   ├── OpportunityForm.tsx
│       │   ├── InteractionList.tsx
│       │   └── InteractionForm.tsx
│       ├── types/
│       │   ├── opportunity.ts
│       │   ├── user.ts
│       │   └── interaction.ts
│       └── pages/
│           ├── LoginPage.tsx
│           ├── DashboardPage.tsx
│           └── OpportunityPage.tsx
├── backend/
│   ├── shared/
│   │   ├── db.ts
│   │   ├── auth.ts
│   │   ├── types.ts
│   │   └── cache.ts
│   ├── auth-service/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── routes/
│   │   │   │   └── auth.ts
│   │   │   └── controllers/
│   │   │       └── authController.ts
│   ├── opportunity-service/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── routes/
│   │   │   │   └── opportunities.ts
│   │   │   └── controllers/
│   │   │       └── opportunityController.ts
│   ├── interaction-service/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── routes/
│   │   │   │   └── interactions.ts
│   │   │   └── controllers/
│   │   │       └── interactionController.ts
```

## 2. ACCEPTANCE CRITERIA

1. El usuario puede autenticarse, registrar prospectos, oportunidades, interacciones y tareas, y visualizar su pipeline y calendario desde la web.
2. Todos los endpoints cumplen con los contratos de SPEC.md, validan entradas, retornan errores estructurados y requieren JWT donde corresponde.
3. El sistema se despliega localmente con `./run.sh`, todos los servicios reportan healthy, y la app es accesible en el navegador.

---

## TEAM SCOPE (MANDATORY — PARSED BY THE PIPELINE)
- **role-tl (technical_lead):** Foundation/shared contracts, DB schema, config
- **role-be (backend_developer):** Auth service, opportunity service, interaction service
- **role-fe (frontend_developer):** React app (hooks, pages, components)
- **role-devops (devops_support):** Infraestructura, Docker, CI/CD, docs

---

## 3. EXECUTABLE ITEMS

---

### ITEM 1: Foundation — shared types, interfaces, DB schemas, config

**Goal:** Crear todos los tipos compartidos, contratos de datos, utilidades, configuración de entorno y esquema SQL de la base de datos para ser usados por los servicios backend y el frontend.

**Files to create:**
- backend/shared/types.ts — Todos los interfaces TypeScript compartidos (Opportunity, OpportunityCreate, User, UserLoginRequest, UserLoginResponse, Interaction, InteractionCreate, Prospect, Task, etc.)
- backend/shared/db.ts — Pool de conexión PostgreSQL, funciones de acceso base
- backend/shared/auth.ts — Utilidades JWT, hash/compare password (jsonwebtoken, bcrypt)
- backend/shared/cache.ts — Cliente Redis y utilidades de cache
- backend/shared/config.ts — Validación de variables de entorno, constantes compartidas
- backend/shared/types.ts — (ya listado, pero debe incluir todos los tipos de SPEC.md y los extendidos para prospectos y tareas)
- backend/src/db/schema.sql — Esquema SQL completo: user, prospect, opportunity, interaction, task, índices y claves foráneas

**Tests required:**
- backend/shared/tests/types.test.ts — Validación de tipos y contratos
- backend/shared/tests/db.test.ts — Prueba de conexión y pool
- backend/shared/tests/auth.test.ts — Prueba de hash, JWT sign/verify
- backend/shared/tests/cache.test.ts — Prueba de conexión Redis y cacheSet/cacheGet

**Dependencies:** None

**Validation:** Ejecutar los tests de shared (`npm test` en backend/shared/), revisar que todos los tipos y utilidades sean importables y funcionales en los servicios.

**Role:** role-tl (technical_lead)

---

### ITEM 2: Auth Service — login y autenticación JWT

**Goal:** Implementar el servicio de autenticación: login de usuario, emisión y validación de JWT, endpoint de usuario actual. Cumple con los endpoints de SPEC.md: POST /api/auth/login, GET /api/auth/me.

**Files to create:**
- backend/auth-service/Dockerfile — Multi-stage build, non-root, EXPOSE 8001, CMD: node dist/src/index.js
- backend/auth-service/package.json — Dependencias (express, typescript, jsonwebtoken, bcrypt, dotenv, cors, morgan, etc.)
- backend/auth-service/tsconfig.json — Configuración TypeScript
- backend/auth-service/src/index.ts — Bootstrap Express, carga config, healthcheck
- backend/auth-service/src/routes/auth.ts — Rutas /api/auth/login, /api/auth/me
- backend/auth-service/src/controllers/authController.ts — Lógica de login, emisión JWT, validación
- backend/auth-service/tests/auth.test.ts — Test de login (happy/error), test de /me (JWT válido/inválido)

**Dependencies:** Item 1

**Validation:** `npm run build && npm test` en backend/auth-service; endpoints /api/auth/login y /api/auth/me responden correctamente; healthcheck OK.

**Role:** role-be (backend_developer)

---

### ITEM 3: Opportunity Service — CRUD de oportunidades y prospectos

**Goal:** Implementar el servicio de oportunidades y prospectos: endpoints para crear, editar, listar, eliminar oportunidades y prospectos, cumpliendo los contratos de SPEC.md y requerimientos funcionales (incluye asociación prospecto-oportunidad).

**Files to create:**
- backend/opportunity-service/Dockerfile — Multi-stage build, non-root, EXPOSE 8002, CMD: node dist/src/index.js
- backend/opportunity-service/package.json — Dependencias (express, typescript, pg, dotenv, cors, morgan, etc.)
- backend/opportunity-service/tsconfig.json — Configuración TypeScript
- backend/opportunity-service/src/index.ts — Bootstrap Express, healthcheck
- backend/opportunity-service/src/routes/opportunities.ts — Rutas /api/opportunities, /api/opportunities/:id (GET, POST, PUT, DELETE)
- backend/opportunity-service/src/controllers/opportunityController.ts — Lógica de CRUD, validación, asociación con prospectos
- backend/opportunity-service/tests/opportunities.test.ts — Test de CRUD (happy/error), validación de JWT

**Dependencies:** Item 1

**Validation:** `npm run build && npm test` en backend/opportunity-service; endpoints CRUD funcionan y validan JWT; healthcheck OK.

**Role:** role-be (backend_developer)

---

### ITEM 4: Interaction Service — CRUD de interacciones y tareas

**Goal:** Implementar el servicio de interacciones y tareas: endpoints para registrar, listar y gestionar interacciones y tareas asociadas a oportunidades/prospectos, cumpliendo los contratos de SPEC.md y requerimientos funcionales.

**Files to create:**
- backend/interaction-service/Dockerfile — Multi-stage build, non-root, EXPOSE 8003, CMD: node dist/src/index.js
- backend/interaction-service/package.json — Dependencias (express, typescript, pg, dotenv, cors, morgan, etc.)
- backend/interaction-service/tsconfig.json — Configuración TypeScript
- backend/interaction-service/src/index.ts — Bootstrap Express, healthcheck
- backend/interaction-service/src/routes/interactions.ts — Rutas /api/interactions (GET, POST), gestión de tareas (según modelo)
- backend/interaction-service/src/controllers/interactionController.ts — Lógica de CRUD de interacciones y tareas, validación
- backend/interaction-service/tests/interactions.test.ts — Test de CRUD (happy/error), validación de JWT

**Dependencies:** Item 1

**Validation:** `npm run build && npm test` en backend/interaction-service; endpoints CRUD funcionan y validan JWT; healthcheck OK.

**Role:** role-be (backend_developer)

---

### ITEM 5: Frontend — React app (hooks, pages, components, API clients)

**Goal:** Implementar la aplicación web en React 18 + TypeScript + Vite, con hooks de estado, clientes API, páginas y componentes para login, dashboard, oportunidades, interacciones, tareas y calendario.

**Files to create:**
- frontend/Dockerfile — Multi-stage build, non-root, EXPOSE 5173, CMD: serve dist
- frontend/vite.config.ts — Configuración Vite
- frontend/tsconfig.json — Configuración TypeScript
- frontend/package.json — Dependencias (react, typescript, axios, tailwind, etc.)
- frontend/public/index.html — HTML de entrada
- frontend/src/main.tsx — Bootstrap React
- frontend/src/App.tsx — Root component, rutas
- frontend/src/api/auth.ts — Cliente API de auth
- frontend/src/api/opportunities.ts — Cliente API de oportunidades
- frontend/src/api/interactions.ts — Cliente API de interacciones
- frontend/src/hooks/useAuth.ts — Hook de estado de auth
- frontend/src/hooks/useOpportunities.ts — Hook de oportunidades
- frontend/src/hooks/useInteractions.ts — Hook de interacciones/tareas
- frontend/src/components/OpportunityList.tsx — Lista de oportunidades
- frontend/src/components/OpportunityForm.tsx — Formulario de oportunidad
- frontend/src/components/InteractionList.tsx — Lista de interacciones
- frontend/src/components/InteractionForm.tsx — Formulario de interacción
- frontend/src/types/opportunity.ts — Tipos de oportunidad
- frontend/src/types/user.ts — Tipos de usuario
- frontend/src/types/interaction.ts — Tipos de interacción/tarea
- frontend/src/pages/LoginPage.tsx — Página de login
- frontend/src/pages/DashboardPage.tsx — Dashboard principal
- frontend/src/pages/OpportunityPage.tsx — Detalle de oportunidad
- frontend/tests/OpportunityList.test.tsx — Test de renderizado y lógica de lista
- frontend/tests/LoginPage.test.tsx — Test de login (happy/error)

**Dependencies:** Item 1

**Validation:** `npm run build && npm test` en frontend; app accesible en navegador, login y flujo principal funcional.

**Role:** role-fe (frontend_developer)

---

### ITEM 6: Infrastructure & Deployment

**Goal:** Orquestar todos los servicios y frontend con Docker Compose, variables de entorno, healthchecks, documentación y script de arranque. Garantizar que el sistema se levanta con `./run.sh` y es accesible localmente.

**Files to create:**
- docker-compose.yml — Orquestación de todos los servicios, healthchecks, depends_on, puertos, build context correcto
- .env.example — Todas las variables de entorno documentadas y con ejemplo
- .gitignore — node_modules, dist, .env, logs, etc.
- .dockerignore — node_modules, .git, dist, logs, etc.
- run.sh — Script bash: valida Docker, build, arranca, espera healthy, imprime URL
- README.md — Instrucciones de uso, endpoints, troubleshooting
- docs/architecture.md — Diagrama de arquitectura y descripción de componentes

**Dependencies:** Items 1-5

**Validation:** Ejecutar `./run.sh` en el root; todos los servicios reportan healthy, la app es accesible en navegador, endpoints funcionales.

**Role:** role-devops (devops_support)

---