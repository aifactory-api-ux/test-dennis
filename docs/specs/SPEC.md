# SPEC.md

## 1. TECHNOLOGY STACK

- **Frontend**
  - React 18.2.0
  - TypeScript 5.4.x
  - Vite 5.x
- **Backend**
  - Node.js 20.x
  - Express 4.18.x
  - TypeScript 5.4.x
- **Database**
  - PostgreSQL 15.x
- **Cache**
  - Redis 7.x
- **Containerization & Deployment**
  - Docker 24.x
  - docker-compose 2.x
  - Railway/Render (deployment target)
- **Other**
  - JWT (jsonwebtoken 9.x)
  - bcrypt 5.x
  - dotenv 16.x
  - pg (node-postgres) 8.x
  - cors 2.8.x
  - morgan 1.10.x

---

## 2. DATA CONTRACTS

### Opportunity

#### TypeScript (frontend & backend)
```typescript
export interface Opportunity {
  id: string; // UUID
  name: string;
  company: string;
  value: number;
  stage: 'lead' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';
  ownerId: string; // UUID (user)
  createdAt: string; // ISO8601
  updatedAt: string; // ISO8601
}
```

### OpportunityCreate

```typescript
export interface OpportunityCreate {
  name: string;
  company: string;
  value: number;
  stage: 'lead' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';
}
```

### User

```typescript
export interface User {
  id: string; // UUID
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string; // ISO8601
}
```

### UserLoginRequest

```typescript
export interface UserLoginRequest {
  email: string;
  password: string;
}
```

### UserLoginResponse

```typescript
export interface UserLoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}
```

### Interaction

```typescript
export interface Interaction {
  id: string; // UUID
  opportunityId: string; // UUID
  userId: string; // UUID
  type: 'call' | 'email' | 'meeting' | 'note';
  content: string;
  createdAt: string; // ISO8601
}
```

### InteractionCreate

```typescript
export interface InteractionCreate {
  opportunityId: string;
  type: 'call' | 'email' | 'meeting' | 'note';
  content: string;
}
```

---

## 3. API ENDPOINTS

### Auth

#### POST /api/auth/login

- **Request Body:** `UserLoginRequest`
- **Response:** `UserLoginResponse`

#### GET /api/auth/me

- **Headers:** `Authorization: Bearer <token>`
- **Response:** `{ id: string; email: string; name: string; }`

---

### Opportunities

#### GET /api/opportunities

- **Headers:** `Authorization: Bearer <token>`
- **Response:** `Opportunity[]`

#### GET /api/opportunities/:id

- **Headers:** `Authorization: Bearer <token>`
- **Response:** `Opportunity`

#### POST /api/opportunities

- **Headers:** `Authorization: Bearer <token>`
- **Request Body:** `OpportunityCreate`
- **Response:** `Opportunity`

#### PUT /api/opportunities/:id

- **Headers:** `Authorization: Bearer <token>`
- **Request Body:** `OpportunityCreate`
- **Response:** `Opportunity`

#### DELETE /api/opportunities/:id

- **Headers:** `Authorization: Bearer <token>`
- **Response:** `{ success: boolean; }`

---

### Interactions

#### GET /api/interactions?opportunityId=...

- **Headers:** `Authorization: Bearer <token>`
- **Query:** `opportunityId: string`
- **Response:** `Interaction[]`

#### POST /api/interactions

- **Headers:** `Authorization: Bearer <token>`
- **Request Body:** `InteractionCreate`
- **Response:** `Interaction`

---

## 4. FILE STRUCTURE

### PORT TABLE

| Service              | Listening Port | Path                        |
|----------------------|---------------|-----------------------------|
| auth-service         | 8001          | backend/auth-service/       |
| opportunity-service  | 8002          | backend/opportunity-service/ |
| interaction-service  | 8003          | backend/interaction-service/ |

### SHARED MODULES

| Shared path          | Imported by services                                 |
|----------------------|-----------------------------------------------------|
| backend/shared/      | auth-service, opportunity-service, interaction-service |

---

### FILE TREE

```
.
├── docker-compose.yml                # Multi-service orchestration
├── .env.example                     # Template for environment variables
├── .gitignore                       # Git ignore rules
├── README.md                        # Project documentation
├── run.sh                           # Root startup script
├── frontend/
│   ├── Dockerfile                   # Frontend Docker build
│   ├── vite.config.ts               # Vite configuration
│   ├── tsconfig.json                # TypeScript config
│   ├── package.json                 # Frontend dependencies
│   ├── public/
│   │   └── index.html               # HTML entry point
│   └── src/
│       ├── main.tsx                 # React entry point
│       ├── App.tsx                  # Root component
│       ├── api/
│       │   ├── auth.ts              # Auth API client
│       │   ├── opportunities.ts     # Opportunities API client
│       │   └── interactions.ts      # Interactions API client
│       ├── hooks/
│       │   ├── useAuth.ts           # Auth state hook
│       │   ├── useOpportunities.ts  # Opportunities state hook
│       │   └── useInteractions.ts   # Interactions state hook
│       ├── components/
│       │   ├── OpportunityList.tsx  # List of opportunities
│       │   ├── OpportunityForm.tsx  # Create/edit opportunity
│       │   ├── InteractionList.tsx  # List of interactions
│       │   └── InteractionForm.tsx  # Add interaction
│       ├── types/
│       │   ├── opportunity.ts       # Opportunity interfaces
│       │   ├── user.ts              # User interfaces
│       │   └── interaction.ts       # Interaction interfaces
│       └── pages/
│           ├── LoginPage.tsx        # Login page
│           ├── DashboardPage.tsx    # Dashboard
│           └── OpportunityPage.tsx  # Opportunity detail
├── backend/
│   ├── shared/
│   │   ├── db.ts                    # DB connection pool
│   │   ├── auth.ts                  # JWT utilities
│   │   ├── types.ts                 # Shared TypeScript types
│   │   └── cache.ts                 # Redis utilities
│   ├── auth-service/
│   │   ├── Dockerfile               # Auth service Docker build
│   │   ├── package.json             # Service dependencies
│   │   ├── tsconfig.json            # TypeScript config
│   │   ├── src/
│   │   │   ├── index.ts             # Express entry point
│   │   │   ├── routes/
│   │   │   │   └── auth.ts          # Auth endpoints
│   │   │   └── controllers/
│   │   │       └── authController.ts# Auth logic
│   ├── opportunity-service/
│   │   ├── Dockerfile               # Opportunity service Docker build
│   │   ├── package.json             # Service dependencies
│   │   ├── tsconfig.json            # TypeScript config
│   │   ├── src/
│   │   │   ├── index.ts             # Express entry point
│   │   │   ├── routes/
│   │   │   │   └── opportunities.ts # Opportunity endpoints
│   │   │   └── controllers/
│   │   │       └── opportunityController.ts # Opportunity logic
│   ├── interaction-service/
│   │   ├── Dockerfile               # Interaction service Docker build
│   │   ├── package.json             # Service dependencies
│   │   ├── tsconfig.json            # TypeScript config
│   │   ├── src/
│   │   │   ├── index.ts             # Express entry point
│   │   │   ├── routes/
│   │   │   │   └── interactions.ts  # Interaction endpoints
│   │   │   └── controllers/
│   │   │       └── interactionController.ts # Interaction logic
```

---

## 5. ENVIRONMENT VARIABLES

| Name                        | Type    | Description                                         | Example Value                |
|-----------------------------|---------|-----------------------------------------------------|-----------------------------|
| NODE_ENV                    | string  | Node environment                                    | development                 |
| PORT                        | number  | Service listening port                              | 8001                        |
| POSTGRES_HOST               | string  | PostgreSQL host                                     | db                          |
| POSTGRES_PORT               | number  | PostgreSQL port                                     | 5432                        |
| POSTGRES_DB                 | string  | PostgreSQL database name                            | testdennis                  |
| POSTGRES_USER               | string  | PostgreSQL user                                     | dennis                      |
| POSTGRES_PASSWORD           | string  | PostgreSQL password                                 | secretpassword              |
| REDIS_HOST                  | string  | Redis host                                          | redis                       |
| REDIS_PORT                  | number  | Redis port                                          | 6379                        |
| JWT_SECRET                  | string  | JWT signing secret                                  | supersecretjwtkey           |
| FRONTEND_URL                | string  | Public frontend URL (CORS)                          | http://localhost:5173       |
| AUTH_SERVICE_URL            | string  | Auth service base URL                               | http://auth-service:8001    |
| OPPORTUNITY_SERVICE_URL     | string  | Opportunity service base URL                        | http://opportunity-service:8002 |
| INTERACTION_SERVICE_URL     | string  | Interaction service base URL                        | http://interaction-service:8003  |

---

## 6. IMPORT CONTRACTS

### backend/shared/db.ts

- `import { getPool } from '../shared/db'` — Exports: `getPool`

### backend/shared/auth.ts

- `import { signJwt, verifyJwt, hashPassword, comparePassword } from '../shared/auth'`

### backend/shared/types.ts

- `import { Opportunity, OpportunityCreate, User, UserLoginRequest, UserLoginResponse, Interaction, InteractionCreate } from '../shared/types'`

### backend/shared/cache.ts

- `import { getRedisClient, cacheGet, cacheSet, cacheInvalidate } from '../shared/cache'`

### backend/auth-service/src/controllers/authController.ts

- `export async function login(req, res): Promise<void>`
- `export async function getMe(req, res): Promise<void>`

### backend/opportunity-service/src/controllers/opportunityController.ts

- `export async function listOpportunities(req, res): Promise<void>`
- `export async function getOpportunity(req, res): Promise<void>`
- `export async function createOpportunity(req, res): Promise<void>`
- `export async function updateOpportunity(req, res): Promise<void>`
- `export async function deleteOpportunity(req, res): Promise<void>`

### backend/interaction-service/src/controllers/interactionController.ts

- `export async function listInteractions(req, res): Promise<void>`
- `export async function createInteraction(req, res): Promise<void>`

### frontend/src/api/auth.ts

- `export async function login(data: UserLoginRequest): Promise<UserLoginResponse>`
- `export async function getMe(token: string): Promise<User>`

### frontend/src/api/opportunities.ts

- `export async function getOpportunities(token: string): Promise<Opportunity[]>`
- `export async function getOpportunity(id: string, token: string): Promise<Opportunity>`
- `export async function createOpportunity(data: OpportunityCreate, token: string): Promise<Opportunity>`
- `export async function updateOpportunity(id: string, data: OpportunityCreate, token: string): Promise<Opportunity>`
- `export async function deleteOpportunity(id: string, token: string): Promise<{ success: boolean }>`

### frontend/src/api/interactions.ts

- `export async function getInteractions(opportunityId: string, token: string): Promise<Interaction[]>`
- `export async function createInteraction(data: InteractionCreate, token: string): Promise<Interaction>`

---

## 7. FRONTEND STATE & COMPONENT CONTRACTS

### React Hooks

#### useAuth()

```typescript
useAuth() → {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (data: UserLoginRequest) => Promise<void>;
  logout: () => void;
}
```

#### useOpportunities()

```typescript
useOpportunities() → {
  opportunities: Opportunity[];
  loading: boolean;
  error: string | null;
  fetchOpportunities: () => Promise<void>;
  createOpportunity: (data: OpportunityCreate) => Promise<void>;
  updateOpportunity: (id: string, data: OpportunityCreate) => Promise<void>;
  deleteOpportunity: (id: string) => Promise<void>;
}
```

#### useInteractions(opportunityId: string)

```typescript
useInteractions(opportunityId: string) → {
  interactions: Interaction[];
  loading: boolean;
  error: string | null;
  createInteraction: (data: InteractionCreate) => Promise<void>;
}
```

---

### Components

#### OpportunityList

```typescript
OpportunityList props: {
  opportunities: Opportunity[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  deletingId: string | null;
}
```

#### OpportunityForm

```typescript
OpportunityForm props: {
  initialData?: OpportunityCreate;
  onSubmit: (data: OpportunityCreate) => void;
  loading: boolean;
}
```

#### InteractionList

```typescript
InteractionList props: {
  interactions: Interaction[];
}
```

#### InteractionForm

```typescript
InteractionForm props: {
  onSubmit: (data: InteractionCreate) => void;
  loading: boolean;
}
```

---

## 8. FILE EXTENSION CONVENTION

- **Frontend files:** `.tsx` (all React components and hooks)
- **Project language:** TypeScript (all frontend and backend code)
- **Entry point:** `/src/main.tsx` (as referenced in `public/index.html`)

**All frontend files use `.tsx` or `.ts` extensions. No `.jsx` or `.js` files are permitted.**  
**All backend files use `.ts` extensions.**