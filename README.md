# CandiDash

Dockerized web application to manage and track job applications.

## Tech Stack

- **Backend**: FastAPI + Python 3.11
- **Database**: PostgreSQL 15
- **ORM**: SQLAlchemy 2.0
- **Migrations**: Alembic
- **Containerization**: Docker + Docker Compose

## Installation and Startup

### Prerequisites

- Docker
- Docker Compose

### First Installation

1. Clone the repository

```bash
git clone <your-repo>
cd candidash
```

2. Create backend environment file

```bash
cp backend/.env.example backend/.env
```

3. Start services

```bash
docker compose up -d
```

4. Initialize database (first time only)

```bash
# Connect to backend container
docker compose exec backend bash

# Initialize Alembic
alembic init alembic

# Create first migration
alembic revision --autogenerate -m "Initial migration"

# Apply migrations
alembic upgrade head
```

### Daily Usage

```bash
# Start application
docker compose up -d

# View logs
docker compose logs -f backend

# Stop application
docker compose down

# Stop and remove volumes (⚠️ data loss)
docker compose down -v
```

## Service Access

- **Backend API**: http://localhost:8000
- **Swagger Documentation**: http://localhost:8000/api/v1/docs
- **ReDoc**: http://localhost:8000/api/v1/redoc
- **PostgreSQL**: localhost:5432

## Project Structure

```
candidash/
├── backend/              # FastAPI backend code
│   ├── app/
│   │   ├── models/      # SQLAlchemy models
│   │   ├── schemas/     # Pydantic schemas
│   │   ├── routers/     # API routes
│   │   └── services/    # Business logic
│   ├── alembic/         # Database migrations
│   └── tests/           # Unit tests
├── frontend/            # Frontend code (coming soon)
├── documents/           # Document storage
└── compose.yaml          # Docker configuration
```

## Development

### Create a New Migration

```bash
docker compose exec backend alembic revision --autogenerate -m "Migration description"
docker compose exec backend alembic upgrade head
```

### Access Python Shell

```bash
docker compose exec backend python
```

### Access PostgreSQL

```bash
docker compose exec db psql -U candidash_user -d candidash_db
```

## API Documentation

Interactive API documentation is available at http://localhost:8000/api/v1/docs once the application is started.

## Naming Conventions

- **Database/Models/API**: Everything in English
- **User-facing content**: In French (UI labels, messages, etc.)
- **Code**: English (variables, functions, classes)
- **Comments**: French accepted for complex business logic

## License

Personal project - Private use
