#!/bin/bash

# ========= CONFIG =========
INPUT_FILE="hosts.txt"
TIMEOUT=10
# ==========================

if [[ ! -f "$INPUT_FILE" ]]; then
  echo "Input file not found: $INPUT_FILE"
  exit 1
fi

while read -r host; do
  [[ -z "$host" ]] && continue

  for scheme in https http; do
    url="${scheme}://${host}"

    # fetch page (follow redirects)
    html=$(curl -L -s --max-time "$TIMEOUT" "$url")
    status=$(curl -L -s -o /dev/null -w "%{http_code}" --max-time "$TIMEOUT" "$url")

    if [[ "$status" == "200" ]]; then
      title=$(echo "$html" | tr '\n' ' ' | sed -n 's/.*<title>\(.*\)<\/title>.*/\1/p')

      if echo "$title" | grep -qiE "Free parking counter|Wolne miejsca parkingowe"; then
        echo "$host | $status | $title"
      fi

      break
    fi
  done

done < "$INPUT_FILE"
