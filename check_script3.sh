#!/bin/bash

INPUT_FILE="hosts.txt"
TIMEOUT=10

while read -r host; do
  [[ -z "$host" ]] && continue
  echo "Checking host: $host"

  # Fetch HTML
  html=$(curl -L -s --max-time "$TIMEOUT" "https://$host")

  # Extract API fetch calls (inline JS)
  api_paths=$(echo "$html" | grep -oP "fetch\(['\"]\Kapi/[^'\"]+" | sort -u)

  # Extract external JS scripts and scan them too
  js_urls=$(echo "$html" | grep -oP "<script[^>]+src=['\"]\K[^'\"]+" | grep "\.js$")
  for js in $js_urls; do
    # Make relative URLs absolute
    [[ "$js" != http* ]] && js="https://$host/$js"
    js_content=$(curl -s --max-time "$TIMEOUT" "$js")
    js_api_paths=$(echo "$js_content" | grep -oP "fetch\(['\"]\Kapi/[^'\"]+" | sort -u)
    api_paths="$api_paths"$'\n'"$js_api_paths"
  done

  # Remove duplicates
  api_paths=$(echo "$api_paths" | sort -u | grep -v '^$')

  # Validate each API
  for api in $api_paths; do
    url="https://$host/$api"
    resp=$(curl -s --max-time "$TIMEOUT" "$url")
    if echo "$resp" | jq . >/dev/null 2>&1; then
      echo "✅ $url is valid JSON"
    else
      echo "⚠️ $url returned invalid JSON or is unreachable"
    fi
  done

done < "$INPUT_FILE"
