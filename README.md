# CandiDash

Dockerized web application to manage and track job applications (personal ATS).

## 🏗️ Tech Stack

- **Backend**: FastAPI + Python 3.11
- **Database**: PostgreSQL 15
- **ORM**: SQLAlchemy 2.0
- **Migrations**: Alembic
- **Containerization**: Docker + Docker Compose
- **Testing**: Pytest + Isolated Docker containers

## 🚀 Installation and Startup

### Prerequisites

- Docker
- Docker Compose

### Initial Installation

Clone the repository:

```bash
git clone <your-repo>
cd candidash
```

### 🔐 Secrets Management (Required)

The application uses **Docker secrets** for sensitive data. You need to create a `secrets/` directory with your credentials before starting.

#### Step 1: Create secrets directory and files

```bash
# Create the secrets directory
mkdir -p secrets

# Generate a secure SECRET_KEY (32+ characters recommended)
openssl rand -hex 32 > secrets/secret_key.txt

# Set proper permissions (read-only for your user)
chmod 600 secrets/secret_key.txt
```

**Note:** The `secrets/` directory is ignored by Git to prevent accidental commits of sensitive data.

#### Step 2: Start the development environment

```bash
# Start services with database credentials
POSTGRES_USER=candidash_user POSTGRES_PASSWORD=candidash_password POSTGRES_DB=candidash_db docker compose up -d --build
```

Database migrations are automatically applied on startup.

**Security Best Practice:** For production, use strong passwords and never commit them to version control.

## 🧪 Tests and Quality (CI)

The project features an isolated testing infrastructure that never touches your development database.

### Run the full test suite

A single script manages the entire lifecycle (Cleanup → Build → Test → Cleanup).

```bash
./run_tests.sh
```

This performs the following:

- Creates an isolated Docker network (`test_net`)
- Starts a fresh, empty PostgreSQL database
- Starts the backend connected to this test database
- Executes the E2E scenario script (`tests/test_integration.py`)

**Note:** Tests use hardcoded credentials (`test_secret_key`) which is acceptable for ephemeral test environments.

## 📂 Project Structure

```
candidash/
├── backend/              # FastAPI backend source code
│   ├── app/              # App logic (Models, Routers, Schemas)
│   ├── alembic/          # Database migrations
│   ├── scripts/          # Utility scripts (wait-for-db.sh)
│   ├── tests/            # Integration and unit tests
│   └── Dockerfile        # Single source of truth for the image
├── secrets/              # Secret files (NOT committed to Git)
│   └── secret_key.txt    # Application secret key
├── frontend/             # Frontend source code (Coming soon)
├── documents/            # Uploaded files storage (Docker Volume)
├── compose.yaml          # Docker config for DEV (Hot-reload, Persistence)
├── compose.test.yaml     # Docker config for TEST (Isolation, Ephemeral)
└── run_tests.sh          # Entry point for CI/Local tests
```

## 💻 Development

### Access Services

- **Backend API**: http://localhost:8000
- **Swagger Documentation**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **PostgreSQL**: localhost:5432

### Useful Commands

Create a new migration (after modifying models):

```bash
docker compose exec backend alembic revision --autogenerate -m "Change description"
```

Manually apply migrations:

```bash
docker compose exec backend alembic upgrade head
```

Access Python Shell:

```bash
docker compose exec backend python
```

Access Database:

```bash
docker compose exec db psql -U candidash_user -d candidash_db
```

Stop and remove all containers (including volumes):

```bash
docker compose down -v --remove-orphans
```

## ⚙️ Configuration (Environment Variables)

### Development Environment

The following variables must be passed at startup:

| Variable            | Description                   | Required | Default (Dev)          |
| ------------------- | ----------------------------- | -------- | ---------------------- |
| `POSTGRES_USER`     | DB User                       | Yes      | `candidash_user`       |
| `POSTGRES_PASSWORD` | DB Password                   | Yes      | `candidash_password`   |
| `POSTGRES_DB`       | DB Name                       | Yes      | `candidash_db`         |

### Secrets (Docker Secrets)

The following secrets are read from files mounted at `/run/secrets/`:

| Secret              | File Path                  | Description                          |
| ------------------- | -------------------------- | ------------------------------------ |
| `SECRET_KEY`        | `secrets/secret_key.txt`   | JWT signing key (HS256, 32+ chars)   |

### Other Configuration

| Variable            | Description                   | Default                |
| ------------------- | ----------------------------- | ---------------------- |
| `POSTGRES_HOST`     | DB Host                       | `db` (internal Docker) |
| `DOCUMENTS_PATH`    | Internal storage path         | `/app/documents`       |
| `ENV`               | Environment (dev, test, prod) | `dev`                  |

## 📏 Naming Conventions

- **Database/Models/API**: Everything in English
- **User-facing content (UI)**: In French (Labels, error messages)
- **Code**: English (variables, functions, classes)
- **Comments**: English (in code)
- **Documentation**: French or English

## 🔒 Security Notes

- Never commit files in `secrets/` directory
- Use strong passwords in production
- The `.gitignore` file prevents accidental commits of secrets
- Test environment uses hardcoded credentials (acceptable for ephemeral containers)
- In production, use Docker Swarm secrets or external secret management (Vault, AWS Secrets Manager)

## License

Personal project - Private use.
