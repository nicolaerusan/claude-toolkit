#!/bin/bash

# Load env vars from project root or script directory
SCRIPT_DIR="$(dirname "$0")"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

if [ -f "$PROJECT_ROOT/.env" ]; then
  source "$PROJECT_ROOT/.env"
elif [ -f "$SCRIPT_DIR/.env" ]; then
  source "$SCRIPT_DIR/.env"
fi

# Check if domain argument provided
if [ -z "$1" ]; then
  echo "Usage: ./check-domain.sh <domain>"
  echo "Example: ./check-domain.sh tinker.land"
  exit 1
fi

DOMAIN="$1"

# Call Porkbun API
response=$(curl -s -X POST "https://api.porkbun.com/api/json/v3/domain/checkDomain/$DOMAIN" \
  -H "Content-Type: application/json" \
  -d "{\"apikey\": \"$PORKBUN_API_KEY\", \"secretapikey\": \"$PORKBUN_SECRET_KEY\"}")

# Parse response
status=$(echo "$response" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
avail=$(echo "$response" | grep -o '"avail":"[^"]*"' | cut -d'"' -f4)

if [ "$status" = "SUCCESS" ]; then
  if [ "$avail" = "yes" ]; then
    # Get price
    price=$(echo "$response" | grep -o '"price":"[^"]*"' | cut -d'"' -f4)
    echo "✅ $DOMAIN - AVAILABLE (\$$price/yr)"
  else
    echo "❌ $DOMAIN - TAKEN"
  fi
else
  echo "⚠️  Error: $response"
fi
