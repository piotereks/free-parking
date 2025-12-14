#!/bin/bash

# ==============================================================================
# Parking Data to Google Form - Based on Node-RED Flow
# ==============================================================================
# This script replicates your Node-RED workflow:
# 1. Fetches parking data from 2 APIs (Green Day & Uniwersystet)
# 2. Extracts counts and timestamps
# 3. Submits to Google Form
# ==============================================================================

set -e

# ==============================================================================
# CONFIGURATION
# ==============================================================================

# API URLs (from your Node-RED flow)
API_URL_GREEN_DAY="https://gd.zaparkuj.pl/api/freegroupcountervalue.json"
API_URL_UNIVERSITY="https://gd.zaparkuj.pl/api/freegroupcountervalue-green.json"

# Google Form URL (from your Node-RED flow)
GOOGLE_FORM_URL="https://docs.google.com/forms/d/e/1FAIpQLSdeQ-rmw_VfOidGmtSNb9DLkt1RfPdduu-jH898sf3lhj17LA/formResponse"

# Form Entry IDs (from your Node-RED function node)
ENTRY_ID_GREEN="entry.2026993163"
ENTRY_TIME_GREEN="entry.51469670"
ENTRY_ID_UNI="entry.1412144904"
ENTRY_TIME_UNI="entry.364658642"

# Logging
LOG_FILE="parking_sync.log"

# ==============================================================================
# FUNCTIONS
# ==============================================================================

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# ==============================================================================
# FETCH PARKING DATA
# ==============================================================================

fetch_parking_data() {
    local url="$1"
    local timestamp=$(date +%s%3N)  # milliseconds like Node-RED $millis()
    
    log "Fetching: $url?time=$timestamp"
    
    local response=$(curl -s -X GET "${url}?time=${timestamp}" \
        -H "Accept: application/json" \
        -H "Cache-Control: no-cache, no-store, must-revalidate" \
        -H "Pragma: no-cache" \
        -H "Expires: 0")
    
    if [ $? -eq 0 ] && [ -n "$response" ]; then
        echo "$response"
    else
        log "ERROR: Failed to fetch from $url"
        return 1
    fi
}

# ==============================================================================
# MAIN EXECUTION
# ==============================================================================

# URL encode function (replaces jq @uri)
urlencode() {
    local string="$1"
    local strlen=${#string}
    local encoded=""
    local pos c o
    
    for (( pos=0 ; pos<strlen ; pos++ )); do
        c=${string:$pos:1}
        case "$c" in
            [-_.~a-zA-Z0-9] ) o="${c}" ;;
            * ) printf -v o '%%%02x' "'$c"
        esac
        encoded+="${o}"
    done
    echo "${encoded}"
}

# Extract JSON value (pure bash, no jq)
extract_json_value() {
    local json="$1"
    local key="$2"
    
    # First try to extract quoted string value (for strings with spaces like timestamps)
    local value=$(echo "$json" | sed -n "s/.*\"${key}\"[[:space:]]*:[[:space:]]*\"\([^\"]*\)\".*/\1/p")
    
    # If no match (numeric value), extract without quotes
    if [ -z "$value" ]; then
        value=$(echo "$json" | sed -n "s/.*\"${key}\"[[:space:]]*:[[:space:]]*\([0-9.-]*\).*/\1/p")
    fi
    
    echo "$value"
}

main() {
    log "=========================================="
    log "Starting parking data sync"
    log "=========================================="
    
    # Check for required tools
    if ! command -v curl &> /dev/null; then
        log "ERROR: curl is not installed. Install with: sudo apt-get install curl"
        exit 1
    fi
    
    # Step 1: Fetch Green Day parking data
    log "Step 1: Fetching Green Day parking data..."
    parking1=$(fetch_parking_data "$API_URL_GREEN_DAY")
    
    if [ -z "$parking1" ]; then
        log "ERROR: No data from Green Day API"
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
        log "ERROR: No data from University API"
        exit 1
    fi
    
    # Extract values from second API (University)
    countUniversity=$(extract_json_value "$parking2" "CurrentFreeGroupCounterValue")
    timestampUniversity=$(extract_json_value "$parking2" "Timestamp")
    
    log "  University: $countUniversity spots free at $timestampUniversity"
    
    # Step 3: Prepare form data (matching your Node-RED function logic)
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
    
    http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 302 ]; then
        log "SUCCESS: Form submitted (HTTP $http_code)"
        log "  Green Day: $countGreenDay @ $timestampGreenDay"
        log "  University: $countUniversity @ $timestampUniversity"
    else
        log "ERROR: Form submission failed (HTTP $http_code)"
        exit 1
    fi
    
    log "=========================================="
    log "Sync completed successfully"
    log "=========================================="
}

# Run main function
main "$@"