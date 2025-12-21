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


# Published CSV (Google Sheets)
CSV_URL="https://docs.google.com/spreadsheets/d/e/2PACX-1vTwLNDbg8KjlVHsZWj9JUnO_OBIyZaRgZ4gZ8_Gbyly2J3f6rlCW6lDHAihwbuLhxWbBkNMI1wdWRAq/pub?gid=411529798&single=true&output=csv"


# Google Form URL
GOOGLE_FORM_URL="https://docs.google.com/forms/d/e/1FAIpQLSdeQ-rmw_VfOidGmtSNb9DLkt1RfPdduu-jH898sf3lhj17LA/formResponse"

# Form Entry IDs
ENTRY_ID_GREEN="entry.2026993163"
ENTRY_TIME_GREEN="entry.51469670"
ENTRY_ID_UNI="entry.1412144904"
ENTRY_TIME_UNI="entry.364658642"

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

# ==============================================================================
# FETCH PARKING DATA
# ==============================================================================

fetch_parking_data() {
    url="$1"
    timestamp=$(date +%s)000

    log "Fetching: $url?time=$timestamp"
    
    response=$(curl -s -X GET "${url}?time=${timestamp}" \
        -H "Accept: application/json" \
        -H "Cache-Control: no-cache, no-store, must-revalidate" \
        -H "Pragma: no-cache" \
        -H "Expires: 0")
    
    if [ $? -eq 0 ] && [ -n "$response" ]; then
        echo "$response"
    else
        log "Failed to fetch from $url"
        return 1
    fi
}

# ==============================================================================
# MAIN EXECUTION
# ==============================================================================

# URL encode function using awk (standard on Busybox)
urlencode() {
    echo "$1" | awk 'BEGIN {
        for (i=0; i<=255; i++) ord[sprintf("%c", i)] = i
    }
    {
        len = length($0)
        for (i=1; i<=len; i++) {
            c = substr($0, i, 1)
            # Safe characters: alphanumeric, dash, underscore, dot, tilde
            if (c ~ /[a-zA-Z0-9.\-_~]/) {
                printf "%s", c
            } else {
                printf "%%%02X", ord[c]
            }
        }
    }'
}

# Extract JSON value (using sed, POSIX compliant)
extract_json_value() {
    json="$1"
    key="$2"
    
    # First try to extract quoted string value
    value=$(echo "$json" | sed -n "s/.*\"${key}\"[[:space:]]*:[[:space:]]*\"\([^\"]*\)\".*/\1/p")
    
    # If no match (numeric value), extract without quotes
    if [ -z "$value" ]; then
        value=$(echo "$json" | sed -n "s/.*\"${key}\"[[:space:]]*:[[:space:]]*\([0-9.-]*\).*/\1/p")
    fi
    
    echo "$value"
}

# ------------------------------------------------------------------------------
# Fetch last row timestamps from published CSV
# Expects headers: gd_time:!:, uni_time (case/space insensitive)
# ------------------------------------------------------------------------------

fetch_last_csv_timestamps() {
    # log ""
    # log "Fetching CSV last row"
    curl -s -L "${CSV_URL}&time=$(date +%s)" | tail -n 1 | awk -F',' '{
    gd = $4; uni = $7
    gsub(/^[ \t"]+|[ \t"]+$/, "", gd)
    gsub(/^[ \t"]+|[ \t"]+$/, "", uni)
    print gd "|" uni
}'
}


main() {
    # Parse arguments
    for arg in "$@"; do
        if [ "$arg" = "-l" ]; then
            VERBOSE=1
        fi
    done

    log "=========================================="
    log "Starting parking data sync"
    log "=========================================="
    
    # Check for required tools
    if ! which curl >/dev/null 2>&1; then
        error "curl is not installed."
        exit 1
    fi
    
    # Random wait to avoid thundering herd (0-60s)
    # Using awk for portable random number generation on Ash/BusyBox
    if [ "$VERBOSE" -eq "0" ]; then 
        wait_time=$(awk 'BEGIN{srand(); print int(rand()*61)}')
        log "Waiting ${wait_time}s before execution..."
        sleep "$wait_time"
    fi
    
    # Step 1: Fetch Green Day parking data
    log "Step 1: Fetching Green Day parking data..."
    parking1=$(fetch_parking_data "$API_URL_GREEN_DAY")
    
    if [ -z "$parking1" ]; then
        error "No data from Green Day API"
        exit 1
    fi

    # Extract values from first API (Green Day)
    countGreenDay=$(extract_json_value "$parking1" "CurrentFreeGroupCounterValue")
    timestampGreenDay=$(extract_json_value "$parking1" "Timestamp")

    log "  Green Day: $countGreenDay spots free at $timestampGreenDay"
    
    # Step 2: Fetch University parking data
    log "Step 2: Fetching University parking data..."
    parking2=$(fetch_parking_data "$API_URL_UNIVERSITY")
    
    if [ -z "$parking2" ]; then
        error "No data from University API"
        exit 1
    fi
    
    # Extract values from second API (University)
    countUniversity=$(extract_json_value "$parking2" "CurrentFreeGroupCounterValue")
    timestampUniversity=$(extract_json_value "$parking2" "Timestamp")

    log "  University: $countUniversity spots free at $timestampUniversity"

    # Step 2.5: Fetch last CSV timestamps
    log "Step 2.5: Fetch last CSV timestamps"
    last_ts=$(fetch_last_csv_timestamps || true)
    lastGreenTs=$(echo "$last_ts" | cut -d'|' -f1)
    lastUniTs=$(echo "$last_ts" | cut -d'|' -f2)

    log "CSV timestamps: GD=$lastGreenTs | UNI=$lastUniTs"
    log ""

    # Skip submit if nothing changed
    if [ "$timestampGreenDay" = "$lastGreenTs" ] && [ "$timestampUniversity" = "$lastUniTs" ]; then
        log "No timestamp change, skipping submission"
        return 0
    fi

    log "Change detected, submitting form"

    # Step 3: Prepare form data
    log "Step 3: Preparing form submission..."
    
    # URL encode values
    valGreen=$(urlencode "$countGreenDay")
    timeGreen=$(urlencode "$timestampGreenDay")
    valUni=$(urlencode "$countUniversity")
    timeUni=$(urlencode "$timestampUniversity")

    # Build form data
    form_data="${ENTRY_ID_GREEN}=${valGreen}&${ENTRY_TIME_GREEN}=${timeGreen}&${ENTRY_ID_UNI}=${valUni}&${ENTRY_TIME_UNI}=${timeUni}"

    log "  Form data prepared"
    
    # Step 4: Submit to Google Form
    log "Step 4: Submitting to Google Form..."
    
    response=$(curl -s -L -X POST "$GOOGLE_FORM_URL" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "$form_data" \
        -w "\n%{http_code}")
    
    # Extract status code (last line)
    http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "302" ]; then
        log "SUCCESS: Form submitted (HTTP $http_code)"
        log "  Green Day: $countGreenDay @ $timestampGreenDay"
        log "  University: $countUniversity @ $timestampUniversity"
    else
        error "Form submission failed (HTTP $http_code)"
        log "Response: $response"
        exit 1
    fi
    
    log "=========================================="
    log "Sync completed successfully"
    log "=========================================="
}

# Run main function
main "$@"