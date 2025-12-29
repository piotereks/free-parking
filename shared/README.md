# @piotereks/parking-shared

Shared parking data logic for web and mobile applications. This framework-agnostic package provides core business logic, data transformations, and state management for parking availability tracking.

## Features

- 🎯 **Pure Business Logic** - No React, DOM, or platform dependencies
- 🔌 **Adapter Pattern** - Inject platform-specific storage, fetch, and logging
- 📊 **Data Transformations** - CSV parsing, API response normalization
- 🧮 **Smart Approximations** - Calculate estimated availability from stale data
- ⚡ **Zustand Store Factory** - Framework-agnostic state management
- ✅ **Fully Tested** - Comprehensive test coverage with Vitest
- 📦 **ESM + CJS** - Dual module format support

## Installation

```bash
npm install @piotereks/parking-shared
```

### Peer Dependencies

```bash
npm install zustand@^5.0.0
```

## Quick Start

### Using Core Utilities

```javascript
import {
  calculateDataAge,
  formatAgeLabel,
  applyApproximations,
  PARKING_MAX_CAPACITY
} from '@piotereks/parking-shared';

// Calculate data age
const age = calculateDataAge('2024-01-15 14:30:00', new Date());
console.log(age); // Age in minutes

// Format age for display
const { display, aria } = formatAgeLabel(age);
console.log(display); // "5 min ago"

// Apply approximations to stale data
const processedData = applyApproximations(parkingData, new Date());
```

### Creating a Store with Adapters

```javascript
import { createParkingStore } from '@piotereks/parking-shared';

// Web adapter example
const webStorageAdapter = {
  get: async (key) => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  },
  set: async (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  },
  remove: async (key) => {
    localStorage.removeItem(key);
  }
};

// Create store with adapters
const useParkingStore = createParkingStore({
  storage: webStorageAdapter,
  logger: console // optional, defaults to console
});

// Use in your components
const realtimeData = useParkingStore(state => state.realtimeData);
const clearCache = useParkingStore(state => state.clearCache);
```

### Mobile (React Native) Example

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createParkingStore } from '@piotereks/parking-shared';

const mobileStorageAdapter = {
  get: async (key) => {
    const item = await AsyncStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  },
  set: async (key, value) => {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },
  remove: async (key) => {
    await AsyncStorage.removeItem(key);
  }
};

const useParkingStore = createParkingStore({
  storage: mobileStorageAdapter
});
```

## Adapter Interfaces

### StorageAdapter

```typescript
interface StorageAdapter {
  get(key: string): Promise<any | null>;
  set(key: string, value: any): Promise<void>;
  remove(key: string): Promise<void>;
  clear?(): Promise<void>; // optional
}
```

### FetchAdapter (Optional)

```typescript
interface FetchAdapter {
  fetch(url: string, options?: RequestInit): Promise<Response>;
  fetchJSON(url: string, options?: RequestInit): Promise<any>;
  fetchText(url: string, options?: RequestInit): Promise<string>;
}
```

### LoggerAdapter (Optional)

```typescript
interface LoggerAdapter {
  log(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
  debug?(...args: any[]): void; // optional
}
```

## API Reference

### Core Utilities

#### `parkingUtils.js`

- `PARKING_MAX_CAPACITY` - Maximum capacity constants
- `APPROXIMATION_THRESHOLD_MINUTES` - Staleness threshold (30 min)
- `normalizeParkingName(name)` - Normalize parking area names
- `getAgeClass(ageMinutes)` - Get CSS class for age styling
- `calculateTotalSpaces(parkingData)` - Sum free spaces
- `isValidParkingData(data)` - Validate data structure
- `calculateDataAge(timestamp, now)` - Calculate age in minutes
- `formatAgeLabel(ageMinutes)` - Format age for display
- `getMaxCapacity(parkingName)` - Get max capacity for area
- `calculateApproximation(staleData, freshData, now)` - Approximate stale data
- `applyApproximations(parkingData, now)` - Process all data with approximations

#### `dateUtils.js`

- `parseTimestamp(raw)` - Parse timestamp strings
- `getAgeInMinutes(from, to)` - Calculate minute difference
- `formatTime(timestamp, locale)` - Format timestamp for display
- `isStaleTimestamp(timestamp, thresholdMinutes)` - Check if data is stale

#### `dataTransforms.js`

- `normalizeKey(key)` - Normalize CSV column keys
- `findColumnKey(row, target)` - Find column in CSV row
- `getRowValue(row, keyName)` - Extract value from CSV row
- `buildEntryFromRow(row, timeKey, valueKey)` - Build data entry
- `extractLastEntry(rows)` - Get last entry from history
- `dedupeHistoryRows(rows)` - Remove duplicate rows
- `parseApiEntry(record)` - Parse API response
- `buildCacheRowFromPayload(gdPayload, uniPayload)` - Build cache row

### Store Factory

#### `createParkingStore(adapters)`

Creates a Zustand store with the following state:

```javascript
{
  // Real-time data
  realtimeData: [],
  realtimeLoading: true,
  realtimeError: null,
  lastRealtimeUpdate: null,
  
  // Historical data
  historyData: [],
  historyLoading: false,
  lastHistoryUpdate: null,
  
  // Control flags
  fetchInProgress: false,
  cacheCleared: false,
  
  // Callbacks
  refreshCallback: null,
  stopAutoRefresh: null,
  
  // Actions
  setRealtimeData,
  setRealtimeLoading,
  setRealtimeError,
  setLastRealtimeUpdate,
  setHistoryData,
  setHistoryLoading,
  setLastHistoryUpdate,
  setFetchInProgress,
  setRefreshCallback,
  setStopAutoRefresh,
  setCacheCleared,
  clearCache,
  resetStore
}
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Build package
npm run build
```

## Testing

The package includes comprehensive tests for all utilities:

- `parkingUtils.test.js` - Core parking logic tests
- `dateUtils.test.js` - Date/time utility tests
- `dataTransforms.test.js` - Data transformation tests

Run tests with:

```bash
npm test
```

## Build Output

The package is built using [tsup](https://tsup.egoist.dev/) and outputs:

- `dist/index.js` - ESM format
- `dist/index.cjs` - CommonJS format
- `dist/index.d.ts` - TypeScript definitions (from JSDoc)

## License

MIT © piotereks

## Related Packages

- **repo-web** - Web application using this shared package
- **repo-mobile** - React Native application using this shared package

## Contributing

This package is designed to be framework-agnostic. When contributing:

1. **No platform-specific APIs** - Use adapter pattern for storage, fetch, etc.
2. **Pure functions preferred** - Keep logic testable and portable
3. **Comprehensive tests** - Maintain high test coverage
4. **JSDoc comments** - Document all public APIs

## Changelog

### 0.1.0-alpha.0

- Initial alpha release
- Core parking utilities extracted from web app
- Date/time utilities
- Data transformation functions
- Store factory with adapter injection
- Full test coverage
