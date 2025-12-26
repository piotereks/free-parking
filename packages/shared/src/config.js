/**
 * Configuration for parking data API endpoints, caching, and external services
 */

// Parking API endpoints
export const API_URLS = [
  'https://gd.zaparkuj.pl/api/freegroupcountervalue.json',
  'https://gd.zaparkuj.pl/api/freegroupcountervalue-green.json'
];

// CORS proxy (only needed for web, mobile apps can make direct requests)
export const CORS_PROXY = 'https://corsproxy.io/?';

// Google Sheets CSV for historical data
export const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTwLNDbg8KjlVHsZWj9JUnO_OBIyZaRgZ4gZ8_Gbyly2J3f6rlCW6lDHAihwbuLhxWbBkNMI1wdWRAq/pub?gid=411529798&single=true&output=csv';

// Cache keys for persistent storage
export const CACHE_KEY_REALTIME = 'parking_realtime_cache';
export const CACHE_KEY_HISTORY = 'parking_history_cache';

// Google Form configuration for submitting parking data samples
// To find the entry IDs:
// 1. Open your Google Form in edit mode
// 2. Right-click on each field and select "Inspect" or "Inspect Element"
// 3. Look for the input element with name="entry.XXXXXXXXXX"
// 4. Copy those entry IDs and replace the values below
//
// Example: If you see <input name="entry.1234567890" ...>, use 'entry.1234567890'
//
// The form should have 4 fields in this order:
// 1. GreenDay Free Spaces (number)
// 2. GreenDay Timestamp (text/datetime)
// 3. Uni Free Spaces (number)
// 4. Uni Timestamp (text/datetime)
export const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdeQ-rmw_VfOidGmtSNb9DLkt1RfPdduu-jH898sf3lhj17LA/formResponse';
export const FORM_ENTRIES = {
  GREENDAY_VALUE: 'entry.2026993163', // TODO: Replace with actual entry ID for GreenDay free spaces
  GREENDAY_TIME: 'entry.51469670',    // TODO: Replace with actual entry ID for GreenDay timestamp
  UNI_VALUE: 'entry.1412144904',      // TODO: Replace with actual entry ID for Uni free spaces
  UNI_TIME: 'entry.364658642'         // TODO: Replace with actual entry ID for Uni timestamp
};

// CSV column aliases for parsing historical data
export const COLUMN_ALIASES = {
  GD_TIME: 'gd_time',
  GD_VALUE: 'greenday free',
  UNI_TIME: 'uni_time',
  UNI_VALUE: 'uni free'
};
