FROM python:3.11-slim

WORKDIR /app

# System dependencies installation
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Dependencies file copy
COPY requirements.txt .

# Dependencies installation
RUN pip install --no-cache-dir -r requirements.txt

# Application code copy
COPY . .

# Port exposure
EXPOSE 8000

# Default command
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
