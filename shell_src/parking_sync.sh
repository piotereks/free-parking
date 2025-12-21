#!/bin/sh

# ==============================================================================
# Parking Data to Google Form - Ash/BusyBox Compatible Version
# Prevents submission if timestamps did not change (CSV last row check)
# ==============================================================================

set -e

# ==============================================================================
# CONFIGURATION
# ==============================================================================

# API URLs
API_URL_GREEN_DAY="https://gd.zaparkuj.pl/api/freegroupcountervalue.json"
API_URL_UNIVERSITY="https://gd.zaparkuj.pl/api/freegroupcountervalue-green.json"

# Google Form URL
GOOGLE_FORM_URL="https://docs.google.com/forms/d/e/1FAIpQLSdeQ-rmw_VfOidGmtSNb9DLkt1RfPdduu-jH898sf3lhj17LA/formResponse"

# Form Entry IDs
ENTRY_ID_GREEN="entry.2026993163"
ENTRY_TIME_GREEN="entry.51469670"
ENTRY_ID_UNI="entry.1412144904"
ENTRY_TIME_UNI="entry.364658642"

# Published CSV (Google Sheets)
CSV_URL="https://docs.google.com/spreadsheets/d/e/2PACX-1vTwLNDbg8KjlVHsZWj9JUnO_OBIyZaRgZ4gZ8_Gbyly2J3f6rlCW6lDHAihwbuLhxWbBkNMI1wdWRAq/pub?gid=411529798&single=true&output=csv"

# Global verbose flag
VERBOSE=0

# ==============================================================================
# FUNCTIONS
# ==============================================================================

log() {
    if [ "$VERBOSE" -eq 1 ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
    fi
}

error() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1" >&2
}

# ------------------------------------------------------------------------------
# Fetch parking JSON (cache-busted)
# ------------------------------------------------------------------------------

fetch_parking_data() {
    url="$1"
    ts=$(date +%s)000

    log "Fetching API: $url"
    curl -s "${url}?time=${ts}"
}

# ------------------------------------------------------------------------------
# URL encode (BusyBox-safe)
# ------------------------------------------------------------------------------

urlencode() {
    echo "$1" | awk 'BEGIN {
        for (i=0; i<=255; i++) ord[sprintf("%c", i)] = i
    }
    {
        for (i=1; i<=length($0); i++) {
            c = substr($0, i, 1)
            if (c ~ /[a-zA-Z0-9.\-_~]/) printf "%s", c
            else printf "%%%02X", ord[c]
        }
    }'
}

# ------------------------------------------------------------------------------
# Extract JSON value (quoted or numeric)
# ------------------------------------------------------------------------------

extract_json_value() {
    echo "$1" | sed -n "s/.*\"$2\"[[:space:]]*:[[:space:]]*\"\{0,1\}\([0-9A-Za-z:.-]*\)\"\{0,1\}.*/\1/p"
}

# ------------------------------------------------------------------------------
# Fetch last row timestamps from published CSV
# Expects headers: gd_time, uni_time (case/space insensitive)
# ------------------------------------------------------------------------------

fetch_last_csv_timestamps() {
    log "Fetching CSV last row"
    curl -s "${CSV_URL}&time=$(date +%s)" | awk -F',' '
        NR==1 {
            for (i=1;i<=NF;i++) {
                k=tolower($i)
                gsub(/^[ \t"]+|[ \t"]+$/, "", k)
                if (k=="gd_time") gd=i
                if (k=="uni_time") uni=i
            }
        }
        NR>1 { row=$0 }
        END {
            if (row!="") {
                split(row,f,",")
                gsub(/^[ \t"]+|[ \t"]+$/, "", f[gd])
                gsub(/^[ \t"]+|[ \t"]+$/, "", f[uni])
                print f[gd] "|" f[uni]
            }
        }'
}

# ==============================================================================
# MAIN
# ==============================================================================

main() {
    # Parse args
    for arg in "$@"; do
        [ "$arg" = "-l" ] && VERBOSE=1
    done

    log "Starting parking sync"

    # Fetch APIs
    parking1=$(fetch_parking_data "$API_URL_GREEN_DAY")
    parking2=$(fetch_parking_data "$API_URL_UNIVERSITY")

    # Extract values
    countGreenDay=$(extract_json_value "$parking1" "CurrentFreeGroupCounterValue")
    timestampGreenDay=$(extract_json_value "$parking1" "Timestamp")

    countUniversity=$(extract_json_value "$parking2" "CurrentFreeGroupCounterValue")
    timestampUniversity=$(extract_json_value "$parking2" "Timestamp")

    log "API timestamps: GD=$timestampGreenDay UNI=$timestampUniversity"

    # Fetch last CSV timestamps
    last_ts=$(fetch_last_csv_timestamps || true)
    lastGreenTs=$(echo "$last_ts" | cut -d'|' -f1)
    lastUniTs=$(echo "$last_ts" | cut -d'|' -f2)

    log "CSV timestamps: GD=$lastGreenTs UNI=$lastUniTs"

    # Skip submit if nothing changed
    if [ "$timestampGreenDay" = "$lastGreenTs" ] && [ "$timestampUniversity" = "$lastUniTs" ]; then
        log "No timestamp change, skipping submission"
        exit 0
    fi

    log "Change detected, submitting form"

    # Prepare form data
    valGreen=$(urlencode "$countGreenDay")
    timeGreen=$(urlencode "$timestampGreenDay")
    valUni=$(urlencode "$countUniversity")
    timeUni=$(urlencode "$timestampUniversity")

    form_data="${ENTRY_ID_GREEN}=${valGreen}&${ENTRY_TIME_GREEN}=${timeGreen}&${ENTRY_ID_UNI}=${valUni}&${ENTRY_TIME_UNI}=${timeUni}"

    # Submit
    curl -s -L -X POST "$GOOGLE_FORM_URL" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "$form_data" >/dev/null

    log "Submission complete"
}

# Run
main "$@"
