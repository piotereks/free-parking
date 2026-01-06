#!/bin/bash

INPUT_FILE="hosts.txt"
TIMEOUT=10

if [[ ! -f "$INPUT_FILE" ]]; then
  echo "Input file not found: $INPUT_FILE"
  exit 1
fi

while read -r host; do
  [[ -z "$host" ]] && continue

  for scheme in https http; do
    url="${scheme}://${host}"
    
    html=$(curl -L -s --max-time "$TIMEOUT" "$url")
    status=$(curl -L -s -o /dev/null -w "%{http_code}" --max-time "$TIMEOUT" "$url")

    if [[ "$status" == "200" ]]; then

      # Count major HTML elements
      div_count=$(echo "$html" | grep -o "<div" | wc -l)
      a_count=$(echo "$html" | grep -o "<a " | wc -l)
      script_fetch_count=$(echo "$html" | grep -o "fetch('api/" | wc -l)
      span_count=$(echo "$html" | grep -o "<span" | wc -l)

      # Heuristic thresholds (adjust as needed)
      if (( div_count < 10 )) && (( a_count < 5 )) && (( span_count >= 1 )) && (( script_fetch_count >= 1 )); then
        echo "$host | $status | Likely Parking Counter Page"
      fi

      break
    fi
  done
done < "$INPUT_FILE"
