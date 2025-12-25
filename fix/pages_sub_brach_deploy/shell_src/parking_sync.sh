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

log_info() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] INFO: $1"
}

log_debug() {
    if [ "$VERBOSE" -eq 1 ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] DEBUG: $1"
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

    log_debug "Fetching: $url?time=$timestamp"
    
    response=$(curl -s -X GET "${url}?time=${timestamp}" \
        -H "Accept: application/json" \
        -H "Cache-Control: no-cache, no-store, must-revalidate" \
        -H "Pragma: no-cache" \
        -H "Expires: 0")
    
    if [ $? -eq 0 ] && [ -n "$response" ]; then
        echo "$response"
    else
        log_debug "Failed to fetch from $url"
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

fetch_last_csv_row() {
    # Return latest CSV row as: GD_Time|GD_Value|UNI_Time|UNI_Value
    curl -s -L \
        -H "Cache-Control: no-cache, no-store, must-revalidate" \
        -H "Pragma: no-cache" \
        -H "Expires: 0" \
        "${CSV_URL}&time=$(date +%s)" | tail -n 1 | awk -F',' '{
    gd_time = $4; gd_val = $2; uni_time = $7; uni_val = $5
    gsub(/^[ \t"]+|[ \t"]+$/, "", gd_time)
    gsub(/^[ \t"]+|[ \t"]+$/, "", gd_val)
    gsub(/^[ \t"]+|[ \t"]+$/, "", uni_time)
    gsub(/^[ \t"]+|[ \t"]+$/, "", uni_val)
    print gd_time "|" gd_val "|" uni_time "|" uni_val
}'
}

# Compare two timestamp strings lexicographically (works for YYYY-MM-DD HH:MM:SS)
# Returns 0 if first <= second, 1 otherwise
is_older_or_equal() {
    a="$1"; b="$2"
    # If either is empty, consider a not older
    if [ -z "$a" ] || [ -z "$b" ]; then
        return 1
    fi
    first=$(printf '%s\n' "$a" "$b" | sort | head -n1)
    [ "$first" = "$a" ] && return 0 || return 1
}

# Returns 0 if first > second, 1 otherwise
is_newer() {
    a="$1"; b="$2"
    if [ -z "$a" ] || [ -z "$b" ]; then
        return 1
    fi
    last=$(printf '%s\n' "$a" "$b" | sort | tail -n1)
    if [ "$last" = "$a" ] && [ "$a" != "$b" ]; then
        return 0
    fi
    return 1
}


main() {
    # Parse arguments
    for arg in "$@"; do
        if [ "$arg" = "-l" ]; then
            VERBOSE=1
        fi
    done

    log_info "=========================================="
    log_info "Starting parking data sync"
    log_info "=========================================="
    
    # Check for required tools
    if ! which curl >/dev/null 2>&1; then
        error "curl is not installed."
        exit 1
    fi
    
    # Random wait to avoid thundering herd (0-60s)
    # Using awk for portable random number generation on Ash/BusyBox
    if [ "$VERBOSE" -eq "0" ]; then 
        wait_time=$(awk 'BEGIN{srand(); print int(rand()*61)}')
        log_info "Waiting ${wait_time}s before execution..."
        sleep "$wait_time"
    fi
    
    # Step 1: Fetch Green Day parking data
    log_info "Step 1: Fetching Green Day parking data..."
    parking1=$(fetch_parking_data "$API_URL_GREEN_DAY")
    
    if [ -z "$parking1" ]; then
        error "No data from Green Day API"
        exit 1
    fi

    # Extract values from first API (Green Day)
    countGreenDay=$(extract_json_value "$parking1" "CurrentFreeGroupCounterValue")
    timestampGreenDay=$(extract_json_value "$parking1" "Timestamp")

    log_info "  Green Day: $countGreenDay spots free at $timestampGreenDay"
    
    # Step 2: Fetch University parking data
    log_info "Step 2: Fetching University parking data..."
    parking2=$(fetch_parking_data "$API_URL_UNIVERSITY")
    
    if [ -z "$parking2" ]; then
        error "No data from University API"
        exit 1
    fi
    
    # Extract values from second API (University)
    countUniversity=$(extract_json_value "$parking2" "CurrentFreeGroupCounterValue")
    timestampUniversity=$(extract_json_value "$parking2" "Timestamp")

    log_info "  University: $countUniversity spots free at $timestampUniversity"

    # Step 3: Fetch last CSV row (timestamps and values)
    log_info "Step 3: Fetching latest CSV snapshot"
    last_row=$(fetch_last_csv_row || true)
    lastGreenTs=$(echo "$last_row" | cut -d'|' -f1)
    lastGreenVal=$(echo "$last_row" | cut -d'|' -f2)
    lastUniTs=$(echo "$last_row" | cut -d'|' -f3)
    lastUniVal=$(echo "$last_row" | cut -d'|' -f4)

    if [ -z "$last_row" ]; then
        log_info "CSV returned no data; treating this run as an initial seed"
    else
        log_debug "CSV timestamps: GD=$lastGreenTs (val=$lastGreenVal) | UNI=$lastUniTs (val=$lastUniVal)"
    fi

    log_info "Step 4: Evaluating timestamps"
    needs_submit=0
    gd_is_new=0
    uni_is_new=0

    if [ -n "$timestampGreenDay" ]; then
        if [ -z "$lastGreenTs" ]; then
            gd_is_new=1
            needs_submit=1
            log_debug "No CSV timestamp for Green Day — API data considered new"
        elif is_newer "$timestampGreenDay" "$lastGreenTs"; then
            gd_is_new=1
            needs_submit=1
            log_debug "Green Day API timestamp is newer than CSV"
        fi
    fi

    if [ -n "$timestampUniversity" ]; then
        if [ -z "$lastUniTs" ]; then
            uni_is_new=1
            needs_submit=1
            log_debug "No CSV timestamp for University — API data considered new"
        elif is_newer "$timestampUniversity" "$lastUniTs"; then
            uni_is_new=1
            needs_submit=1
            log_debug "University API timestamp is newer than CSV"
        fi
    fi

    if [ -z "$timestampGreenDay" ] && [ -n "$lastGreenTs" ]; then
        log_debug "Missing Green Day API timestamp — using CSV fallback"
        timestampGreenDay="$lastGreenTs"
        countGreenDay="$lastGreenVal"
    elif [ -n "$lastGreenTs" ] && is_older_or_equal "$timestampGreenDay" "$lastGreenTs"; then
        log_debug "Green Day API timestamp is not newer — syncing to CSV values"
        timestampGreenDay="$lastGreenTs"
        countGreenDay="$lastGreenVal"
    fi

    if [ -z "$timestampUniversity" ] && [ -n "$lastUniTs" ]; then
        log_debug "Missing University API timestamp — using CSV fallback"
        timestampUniversity="$lastUniTs"
        countUniversity="$lastUniVal"
    elif [ -n "$lastUniTs" ] && is_older_or_equal "$timestampUniversity" "$lastUniTs"; then
        log_debug "University API timestamp is not newer — syncing to CSV values"
        timestampUniversity="$lastUniTs"
        countUniversity="$lastUniVal"
    fi

    if [ "$needs_submit" -eq 0 ]; then
        log_info "CSV already reflects the latest data; skipping submission"
        return 0
    fi

    log_debug "Submission flags -> Green Day new: $gd_is_new | University new: $uni_is_new"

    log_info "Change detected, preparing submission"

    # Step 5: Prepare form data
    log_info "Step 5: Preparing form payload"
    
    # URL encode values
    valGreen=$(urlencode "$countGreenDay")
    timeGreen=$(urlencode "$timestampGreenDay")
    valUni=$(urlencode "$countUniversity")
    timeUni=$(urlencode "$timestampUniversity")

    # Build form data
    form_data="${ENTRY_ID_GREEN}=${valGreen}&${ENTRY_TIME_GREEN}=${timeGreen}&${ENTRY_ID_UNI}=${valUni}&${ENTRY_TIME_UNI}=${timeUni}"

    log_debug "  Form data prepared"
    
    # Step 6: Submit to Google Form
    log_info "Step 6: Submitting to Google Form..."
    
    response=$(curl -s -L -X POST "$GOOGLE_FORM_URL" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "$form_data" \
        -w "\n%{http_code}")
    
    # Extract status code (last line)
    http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "302" ]; then
        log_info "SUCCESS: Form submitted (HTTP $http_code)"
        log_info "  Green Day: $countGreenDay @ $timestampGreenDay"
        log_info "  University: $countUniversity @ $timestampUniversity"
    else
        error "Form submission failed (HTTP $http_code)"
        log_debug "Response: $response"
        exit 1
    fi
    
    log_info "=========================================="
    log_info "Sync completed successfully"
    log_info "=========================================="
}

# Run main function
main "$@"