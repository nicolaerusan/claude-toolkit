#!/bin/bash

# Load env vars from project root or script directory
SCRIPT_DIR="$(dirname "$0")"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

if [ -f "$PROJECT_ROOT/.env" ]; then
  source "$PROJECT_ROOT/.env"
elif [ -f "$SCRIPT_DIR/.env" ]; then
  source "$SCRIPT_DIR/.env"
fi

# Best candidates for umbrella company - .land and .studio (can't whois these)
DOMAINS=(
  # .land - whimsical territory vibes
  "weird.land"
  "ship.land"
  "build.land"
  "projects.land"
  "madethis.land"
  "tinker.land"
  "hackshop.land"
  "labwork.land"
  "shipweird.land"
  "funlab.land"
  # .studio - creative professional
  "tinker.studio"
  "ship.studio"
  "build.studio"
  "oddjobs.studio"
  "sideproject.studio"
  "hackshop.studio"
  "funlab.studio"
  "shipweird.studio"
  # .wtf - chaotic energy
  "ship.wtf"
  "build.wtf"
  "projects.wtf"
  "weird.wtf"
)

echo "🔍 Checking ${#DOMAINS[@]} domains via Porkbun API"
echo "⏱️  Rate limit: 1/10s = ~$((${#DOMAINS[@]} * 11 / 60)) minutes"
echo ""
echo "--- RESULTS ---"

available=()
taken=()

for domain in "${DOMAINS[@]}"; do
  response=$(curl -s -X POST "https://api.porkbun.com/api/json/v3/domain/checkDomain/$domain" \
    -H "Content-Type: application/json" \
    -d "{\"apikey\": \"$PORKBUN_API_KEY\", \"secretapikey\": \"$PORKBUN_SECRET_KEY\"}")

  status=$(echo "$response" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)

  if [ "$status" = "ERROR" ]; then
    # Rate limited - wait and retry
    sleep 10
    response=$(curl -s -X POST "https://api.porkbun.com/api/json/v3/domain/checkDomain/$domain" \
      -H "Content-Type: application/json" \
      -d "{\"apikey\": \"$PORKBUN_API_KEY\", \"secretapikey\": \"$PORKBUN_SECRET_KEY\"}")
  fi

  avail=$(echo "$response" | grep -o '"avail":"[^"]*"' | cut -d'"' -f4)

  if [ "$avail" = "yes" ]; then
    price=$(echo "$response" | grep -o '"registration":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo "✅ $domain - \$$price/yr"
    available+=("$domain (\$$price)")
  else
    echo "❌ $domain"
    taken+=("$domain")
  fi

  sleep 11
done

echo ""
echo "=== SUMMARY ==="
echo "✅ Available (${#available[@]}):"
for d in "${available[@]}"; do echo "   $d"; done
echo ""
echo "❌ Taken (${#taken[@]}): ${#taken[@]} domains"
