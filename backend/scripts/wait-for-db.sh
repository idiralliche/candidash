#!/bin/bash
set -e

db_host="$1"
db_port="$2"
max_wait_time=60
elapsed=0

if [ -z "$db_host" ] || [ -z "$db_port" ]; then
  echo "Error: DB_HOST or DB_PORT is not defined."
  exit 1
fi

echo "⏳ Waiting for database availability on $db_host:$db_port..."

# Loop until TCP connection succeeds
while ! timeout 1 bash -c "echo > /dev/tcp/$db_host/$db_port" 2>/dev/null; do
  if [ $elapsed -ge $max_wait_time ]; then
    echo "❌ Error: Database is not available after $max_wait_time seconds."
    exit 1
  fi
  echo "   ... Waiting for DB ($elapsed s)"
  sleep 2
  elapsed=$((elapsed + 2))
done

echo "✅ Database is available!"
