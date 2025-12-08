# CandiDash

**Your personal, self-hosted Applicant Tracking System (ATS).**

CandiDash is a modern web application designed to help job seekers structure, track, and optimize their application process. Instead of scattered spreadsheets and notes, you get a centralized, secure, and multi-tenant backend that organizes companies, contacts, opportunities, and documents in one place.

> **Project Status: MVP**
>
> CandiDash is currently an MVP focused on the backend and core domain model.  
> The goal is to provide a solid, well-tested foundation (multi-tenant API, data model, and infrastructure) that will evolve over time with new features and a dedicated frontend.  
> Contributions, ideas, and feedback are very welcome.

---

## ✨ Features

- **Centralized Data**: Manage companies, contacts, products, opportunities, applications, documents, and scheduled events in a single system.
- **Application Tracking**: Follow your applications from initial contact to hiring, with clear status history.
- **Document Management**: Attach resumes, cover letters, and other documents to applications and other entities via a polymorphic association system.
- **Scheduling & Actions**: Track interviews, follow-ups, and other actions related to your applications.
- **Multi-Tenancy**: Strong data isolation – each user only sees and manages their own data.
- **API-First Design**: A robust, well-structured REST API documented through OpenAPI.

---

## 🏗 Tech Stack

CandiDash is built on a modern, maintainable, and production-ready stack:

- **Backend**: FastAPI (Python 3.11)
- **Database**: PostgreSQL 15
- **ORM**: SQLAlchemy 2.0
- **Migrations**: Alembic
- **Authentication & Security**:
  - JWT (HS256)
  - Secure password hashing (e.g. Argon2)
  - Multi-tenancy via `owner_id` and ownership validators
- **Containerization**: Docker & Docker Compose
- **Testing**: Pytest with fully isolated Docker-based test environment
- **API Specification**: OpenAPI schema (generated as `backend/openapi.yaml`)

---

## 🚀 Getting Started

### Prerequisites

- Docker
- Docker Compose
- `openssl` (optional but recommended to generate secure secrets)

### 1. Clone the Repository

```bash
git clone git@github.com:idiralliche/candidash.git
cd candidash
```

### 2. Secrets Management

CandiDash uses **Docker secrets** for sensitive information. Create a `secrets/` directory at the root of the project and initialize the application secret key:

```bash
mkdir -p secrets

# Generate a secure SECRET_KEY (64 hex characters = 32 bytes)
openssl rand -hex 32 > secrets/secret_key.txt

# Restrict permissions
chmod 600 secrets/secret_key.txt
```

> The `secrets/` directory is ignored by Git to prevent accidental leaks.

### 3. Start the Development Environment

Run the services with a local development database:

```bash
POSTGRES_USER=candidash_user \
POSTGRES_PASSWORD=candidash_password \
POSTGRES_DB=candidash_db \
docker compose up -d --build
```

On startup, the backend will:

- Wait for the database to be ready
- Apply all Alembic migrations
- Start the FastAPI application on port `8000`

### 4. Accessing the Services

- **API Root**: http://localhost:8000/api/v1
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

To stop and clean the development environment:

```bash
docker compose down -v --remove-orphans
```

---

## 🧪 Testing

CandiDash includes a dedicated, fully isolated test environment that never touches your development database.

To run the full test suite:

```bash
./run_tests.sh
```

This script will:

- Tear down any previous test environment
- Build and start a dedicated test stack (`compose.test.yaml`)
- Run `pytest` inside the test container against a fresh PostgreSQL test database
- Exit with the appropriate status code and clean up all test containers and volumes

The tests cover:

- Authentication and authorization
- Core CRUD operations (companies, contacts, products, opportunities, applications, documents, scheduled events)
- Association tables (opportunity-products, opportunity-contacts, document-associations)
- Multi-tenancy and data isolation
- Business rules such as partial uniqueness of SIRET per user

---

## 📂 Project Structure

```text
candidash/
├── backend/
│   ├── app/
│   │   ├── core/            # Core config, security, dependencies
│   │   ├── models/          # SQLAlchemy models (User, Company, Opportunity, Application, etc.)
│   │   ├── schemas/         # Pydantic schemas for request/response models
│   │   ├── routers/         # FastAPI routers (companies, products, opportunities, ...)
│   │   ├── utils/           # Helpers (ownership validators, DB helpers, etc.)
│   │   └── main.py          # FastAPI application setup and router mounting
│   ├── alembic/             # Database migration scripts
│   ├── scripts/
│   │   ├── wait-for-db.sh   # DB readiness helper
│   │   └── generate_openapi.py  # OpenAPI schema generation script
│   ├── tests/               # Pytest suite
│   └── Dockerfile           # Backend Docker image
├── documents/               # Document storage (Docker volume)
├── secrets/                 # Docker secrets (not committed)
│   └── secret_key.txt
├── frontend/                # Frontend code (planned / future work)
├── compose.yaml             # Docker Compose for development
├── compose.test.yaml        # Docker Compose for tests
└── run_tests.sh             # Test runner script
```

---

## ⚙️ Configuration

You can customize the behavior of the application through environment variables passed to Docker Compose.

### Core Environment Variables

| Variable            | Description                     | Default (dev)          |
|---------------------|---------------------------------|------------------------|
| `POSTGRES_USER`     | Database user                   | `candidash_user`       |
| `POSTGRES_PASSWORD` | Database password               | `candidash_password`   |
| `POSTGRES_DB`       | Database name                   | `candidash_db`         |
| `POSTGRES_HOST`     | Database host (Docker service)  | `db`                   |
| `DOCUMENTS_PATH`    | Internal path for documents     | `/app/documents`       |
| `ENV`               | Environment (`dev/test/prod`)   | `dev`                  |

### Secrets

The following secret is read from the `secrets/` directory and mounted as a Docker secret:

| Secret       | Local file path            | Description                                |
|--------------|----------------------------|--------------------------------------------|
| `SECRET_KEY` | `secrets/secret_key.txt`   | JWT signing key (HS256, at least 32 bytes) |

In production environments, you should use a proper secret management solution (Docker Swarm secrets, Vault, AWS Secrets Manager, etc.).

---

## 🧩 Database Migrations

If you change the SQLAlchemy models, you should generate and apply a new Alembic migration.

Generate a new migration:

```bash
docker compose exec backend alembic revision --autogenerate -m "describe your change"
```

Apply migrations:

```bash
docker compose exec backend alembic upgrade head
```

---

## 🤝 Contributing

Contributions are welcome!

If you would like to fix a bug, propose an improvement, or add a feature:

1. **Fork** the repository
2. Create a feature branch:
   ```bash
   git checkout -b feature/my-new-feature
   ```
3. Implement your changes
4. Run the tests:
   ```bash
   ./run_tests.sh
   ```
5. Open a **Pull Request** with a clear description of your changes and the motivation behind them

Suggestions and feedback are also appreciated via issues.

---

## 📘 API Documentation & OpenAPI

The API is self-documented and exposes an OpenAPI schema.

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

To generate the OpenAPI schema as a YAML file (for client generation or external documentation):

```bash
docker compose exec backend python scripts/generate_openapi.py
```

This will produce `backend/openapi.yaml`.

---

## 🔒 Security & Multi-Tenancy

- Authentication is based on **JWT Bearer tokens**.
- Passwords are stored using secure hashing.
- Every business entity (companies, opportunities, contacts, products, applications, documents, scheduled events, actions, associations) is owned by a specific user via an `owner_id` field.
- All endpoints enforce ownership checks so that users can only access and manipulate their own data.
- Association tables (`opportunity_products`, `opportunity_contacts`, `document_associations`) also apply strict ownership validation on all foreign keys.

In production, you should:

- Use strong, unique passwords and secrets
- Serve the API behind HTTPS
- Carefully configure CORS and any reverse proxy (e.g., Nginx, Traefik)

---

## 📄 License

This project is licensed under the **MIT License**.

You are free to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of this software, subject to the conditions described in the `LICENSE` file.
