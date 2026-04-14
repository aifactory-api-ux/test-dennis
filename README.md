# test Dennis - Pre-sales Pipeline Platform

Plataforma de seguimiento de oportunidades de venta para Dennis, pre-sales de APUX.

## Visión del Proyecto

Sistema integral para gestionar prospectos, oportunidades de venta y el ciclo de pre-ventas, incluyendo:
- Registro y seguimiento de oportunidades
- Historial de interacciones
- Gestión de tareas
- Visualización del pipeline

## Arquitectura

```
┌─────────────┐     ┌─────────────┐
│   Frontend  │     │   Gateway   │
│  (React 18) │     │   (nginx)   │
└──────┬──────┘     └──────┬──────┘
       │                   │
       └─────────┬─────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
┌───┴───┐  ┌────┴────┐  ┌───┴────┐
│ Auth  │  │Opportun.│  │Interac.│
│:8001  │  │ :8002   │  │ :8003  │
└───┬───┘  └────┬────┘  └───┬────┘
    └──────────┼───────────┘
               │
    ┌──────────┼──────────┐
    │          │          │
┌───┴───┐  ┌──┴──┐  ┌───┴────┐
│PostgreSQL│  │Redis│  │       │
│  :5432  │  │:6379│  │       │
└─────────┘  └─────┘  └───────┘
```

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Containerization**: Docker + docker-compose

## Quick Start

```bash
# Clonar el proyecto
git clone <repo-url>
cd test-dennis

# Iniciar todos los servicios
./run.sh
```

La aplicación estará disponible en: **http://localhost:3000**

### Credenciales por defecto

- Email: `dennis@apux.com`
- Contraseña: `Dennis2024!`

## Scripts

| Script | Descripción |
|--------|-------------|
| `./run.sh` | Inicia todos los servicios |
| `./run.sh stop` | Detiene todos los servicios |
| `docker-compose logs -f` | Ver logs en tiempo real |
| `docker-compose restart <service>` | Reiniciar un servicio |

## API Endpoints

### Auth Service (Puerto 8001)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/auth/me` | Obtener usuario actual |

### Opportunity Service (Puerto 8002)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/opportunities` | Listar oportunidades |
| GET | `/api/opportunities/:id` | Obtener oportunidad por ID |
| POST | `/api/opportunities` | Crear oportunidad |
| PUT | `/api/opportunities/:id` | Actualizar oportunidad |
| DELETE | `/api/opportunities/:id` | Eliminar oportunidad |

### Interaction Service (Puerto 8003)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/interactions` | Listar interacciones |
| GET | `/api/interactions?opportunityId=:id` | Interacciones por oportunidad |
| POST | `/api/interactions` | Crear interacción |

## Stages del Pipeline

Las oportunidades pasan por los siguientes stages:

1. **lead** - Nuevo lead
2. **contacted** - Primer contacto realizado
3. **qualified** - Calificado
4. **proposal** - Propuesta enviada
5. **won** - Ganado
6. **lost** - Perdido

## Tipos de Interacción

- **call** - Llamada telefónica
- **email** - Correo electrónico
- **meeting** - Reunión
- **note** - Nota

## Variables de Entorno

Ver `.env.example` para todas las variables disponibles.

## Troubleshooting


### Los servicios no inician

1. Verificar que Docker esté corriendo: `docker ps`
2. Ver logs: `docker-compose logs`
3. Reconstruir: `docker-compose build --no-cache`

### Error de conexión a PostgreSQL

Verificar que las variables `POSTGRES_HOST`, `POSTGRES_USER`, `POSTGRES_PASSWORD` estén correctas en `.env`.

### Error de conexión a Redis

Verificar que Redis esté corriendo: `docker-compose ps redis`

## Desarrollo

### Construcción local

```bash
# Backend
cd backend/auth-service
npm install
npm run build

# Frontend
cd frontend
npm install
npm run build
```

### Puertos por defecto

| Servicio | Puerto |
|----------|--------|
| Frontend | 3000 |
| Auth | 8001 |
| Opportunity | 8002 |
| Interaction | 8003 |
| PostgreSQL | 5432 |
| Redis | 6379 |

## Licencia

Proprietario - APUX
