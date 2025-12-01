import yaml
import sys
import os
from pathlib import Path

# Add parent directory to path to allow importing 'app'
sys.path.append(str(Path(__file__).parent.parent))

try:
    from app.main import app
except ImportError as e:
    print(f"❌ Critical Error: Could not import FastAPI application.\n{e}")
    sys.exit(1)

def generate_openapi_yaml():
    print("🔄 Extracting OpenAPI schema from FastAPI...")

    # Retrieve OpenAPI dictionary
    openapi_schema = app.openapi()

    # Output path (at backend root for easy visibility)
    output_path = Path(__file__).parent.parent / "openapi.yaml"

    with open(output_path, "w", encoding="utf-8") as f:
        # allow_unicode=True to preserve French accents in descriptions
        yaml.dump(openapi_schema, f, sort_keys=False, allow_unicode=True)

    print(f"✅ Success! File generated: {output_path}")
    print("   You can now use it to generate your Frontend client.")

if __name__ == "__main__":
    generate_openapi_yaml()
