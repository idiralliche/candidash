FROM python:3.11-slim

WORKDIR /app

# System dependencies installation
# Added postgresql-client for potential debugging and bash support
# Added libmagic1 for python-magic file type detection
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    libmagic1 \
    && rm -rf /var/lib/apt/lists/*

# Dependencies file copy
COPY requirements.txt .

# Dependencies installation
RUN pip install --no-cache-dir -r requirements.txt

# Application code copy
COPY . .

# Make the wait script executable
RUN chmod +x scripts/wait-for-db.sh

# Port exposure
EXPOSE 8000

# Default command
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
