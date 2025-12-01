#!/bin/bash
set -e

echo "🚀 STARTING TEST PROCESS..."

# 1. Cleanup
docker compose -f compose.test.yaml down -v --remove-orphans

# 2. Run Tests (Build + Run)
echo "🧪 Building and Running Test Suite..."

# --build : Force image rebuild to include latest code changes
# --abort-on-container-exit : Stop everything once tests finish
# --exit-code-from tester : Return python script exit code
docker compose -f compose.test.yaml up --build \
    --exit-code-from tester \
    --abort-on-container-exit

EXIT_CODE=$?

# 3. Final Cleanup
echo "🧹 Cleaning up test environment..."
docker compose -f compose.test.yaml down -v

exit $EXIT_CODE
