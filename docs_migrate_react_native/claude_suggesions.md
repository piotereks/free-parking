# React Native Conversion Guide
## Converting Free-Parking Web App to React Native with Expo

---

## Executive Summary

This guide provides a structured approach to convert your React web parking monitoring app to a React Native mobile application using Expo. The conversion will maintain core functionality while adapting to mobile-first design patterns.

---

## Table of Contents

1. [Repository Structure](#repository-structure)
2. [Technology Stack Changes](#technology-stack-changes)
3. [Architecture Overview](#architecture-overview)
4. [Phase-by-Phase Conversion Plan](#phase-by-phase-conversion-plan)
5. [Component Mapping Strategy](#component-mapping-strategy)
6. [Key Technical Considerations](#key-technical-considerations)
7. [Development Workflow](#development-workflow)
8. [Testing Strategy](#testing-strategy)
9. [Deployment Pipeline](#deployment-pipeline)

---

## Repository Structure

### Option 1: Monorepo (Recommended)

```
free-parking/
├── packages/
│   ├── web/                    # Existing React web app
│   │   ├── src/
│   │   ├── public/
│   │   └── package.json
│   │
│   ├── mobile/                 # New React Native app
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── screens/
│   │   │   ├── navigation/
│   │   │   ├── store/
│   │   │   ├── utils/
│   │   │   ├── hooks/
│   │   │   └── theme/
│   │   ├── assets/
│   │   ├── app.json
│   │   ├── App.tsx
│   │   └── package.json
│   │
│   └── shared/                 # Shared business logic
│       ├── src/
│       │   ├── store/          # Zustand store
│       │   ├── api/            # API layer
│       │   ├── utils/          # Utilities
│       │   ├── types/          # TypeScript types
│       │   └── constants/
│       └── package.json
│
├── package.json                # Root package.json
├── .gitignore
└── README.md
```

**Pros:**
- Share business logic between web and mobile
- Consistent versioning
- Unified CI/CD
- Easier dependency management

### Option 2: Separate Repository

```
free-parking-mobile/           # New repository
├── src/
│   ├── components/
│   ├── screens/
│   ├── navigation/
│   ├── store/
│   ├── utils/
│   └── theme/
├── assets/
├── app.json
├── App.tsx
└── package.json
```

**Pros:**
- Independent deployment cycles
- Simpler initial setup
- Separate team ownership possible

**Recommendation:** Use **Option 1 (Monorepo)** with tools like `npm workspaces` or `yarn workspaces`.

---

## Technology Stack Changes

### Web → Mobile Mapping

| Web Technology | Mobile Replacement | Notes |
|---------------|-------------------|-------|
| React (Web) | React Native | Core framework |
| Vite | Expo | Development tooling |
| CSS/Tailwind | React Native StyleSheet + theme | No CSS support |
| ReactECharts | react-native-chart-kit or Victory Native | Chart library |
| react-router | React Navigation | Navigation |
| localStorage | AsyncStorage / Expo SecureStore | Storage |
| fetch (CORS proxy) | fetch (native) | No CORS issues |
| papaparse | papaparse (works in RN) | CSV parsing |

### New Dependencies

```json
{
  "dependencies": {
    "expo": "~51.0.0",
    "react-native": "0.74.5",
    "react-native-safe-area-context": "^4.10.5",
    "react-native-screens": "^3.31.1",
    "@react-navigation/native": "^6.1.17",
    "@react-navigation/stack": "^6.3.29",
    "react-native-gesture-handler": "^2.16.1",
    "react-native-reanimated": "^3.10.1",
    "react-native-chart-kit": "^6.12.0",
    "react-native-svg": "^15.2.0",
    "@react-native-async-storage/async-storage": "^1.23.1",
    "expo-status-bar": "~1.12.1",
    "zustand": "^4.5.2",
    "papaparse": "^5.4.1"
  }
}
```

---

## Architecture Overview

### Shared Business Logic Architecture

```
┌─────────────────────────────────────────┐
│           Presentation Layer            │
├──────────────────┬──────────────────────┤
│   Web (React)    │  Mobile (RN + Expo) │
│   - JSX/CSS      │  - JSX/RN Styles    │
│   - React Router │  - React Navigation │
│   - DOM Events   │  - Touch/Gestures   │
└──────────────────┴──────────────────────┘
            │                │
            └────────┬───────┘
                     ▼
┌─────────────────────────────────────────┐
│         Shared Business Logic           │
│  - Zustand Store (parkingStore)         │
│  - API Layer (data fetching)            │
│  - Utils (dateUtils, parkingUtils)      │
│  - Constants (PARKING_MAX_CAPACITY)     │
└─────────────────────────────────────────┘
```

---

## Phase-by-Phase Conversion Plan

### Phase 1: Setup & Foundation (Week 1)

**Goals:**
- Set up Expo project
- Configure monorepo structure
- Extract shared business logic

**Tasks:**
1. Initialize Expo project
   ```bash
   npx create-expo-app packages/mobile --template blank-typescript
   ```

2. Set up monorepo with workspaces
   ```json
   // Root package.json
   {
     "name": "free-parking",
     "private": true,
     "workspaces": [
       "packages/web",
       "packages/mobile",
       "packages/shared"
     ]
   }
   ```

3. Create shared package
   ```bash
   mkdir -p packages/shared/src
   cd packages/shared
   npm init -y
   ```

4. Move shared code:
   - `store/parkingStore.js` → `packages/shared/src/store/`
   - `utils/dateUtils.js` → `packages/shared/src/utils/`
   - `utils/parkingUtils.js` → `packages/shared/src/utils/`
   - API constants → `packages/shared/src/constants/`

**Deliverable:** Working Expo "Hello World" with shared package linked

---

### Phase 2: Core UI Components (Week 2)

**Goals:**
- Convert basic components to React Native
- Implement theming system
- Create navigation structure

**Tasks:**

1. **Create Theme System**
   ```typescript
   // packages/mobile/src/theme/index.ts
   export const lightTheme = {
     colors: {
       background: '#f8fafc',
       card: '#ffffff',
       text: '#1e293b',
       textSecondary: '#64748b',
       border: '#cbd5e1',
       success: '#10b981',
       warning: '#f59e0b',
       error: '#ef4444',
       accent: '#00d9ff'
     },
     spacing: {
       xs: 4,
       sm: 8,
       md: 16,
       lg: 24,
       xl: 32
     },
     borderRadius: {
       sm: 8,
       md: 12,
       lg: 16
     }
   };
   
   export const darkTheme = {
     colors: {
       background: '#0f172a',
       card: '#1e293b',
       text: '#f1f5f9',
       textSecondary: '#94a3b8',
       border: '#334155',
       success: '#10b981',
       warning: '#f59e0b',
       error: '#ef4444',
       accent: '#00d9ff'
     },
     ...lightTheme.spacing,
     ...lightTheme.borderRadius
   };
   ```

2. **Set up Navigation**
   ```typescript
   // packages/mobile/src/navigation/RootNavigator.tsx
   import { createStackNavigator } from '@react-navigation/stack';
   
   const Stack = createStackNavigator();
   
   export default function RootNavigator() {
     return (
       <Stack.Navigator screenOptions={{ headerShown: false }}>
         <Stack.Screen name="Dashboard" component={DashboardScreen} />
         <Stack.Screen name="Statistics" component={StatisticsScreen} />
       </Stack.Navigator>
     );
   }
   ```

3. **Convert ParkingCard Component**
   ```typescript
   // packages/mobile/src/components/ParkingCard.tsx
   import { View, Text, StyleSheet } from 'react-native';
   
   interface ParkingCardProps {
     name: string;
     freeSpots: number;
     age: number;
     isApproximated?: boolean;
   }
   
   export const ParkingCard: React.FC<ParkingCardProps> = ({
     name,
     freeSpots,
     age,
     isApproximated
   }) => {
     return (
       <View style={styles.card}>
         <Text style={styles.name}>{name}</Text>
         <Text style={styles.spots}>
           {isApproximated && '≈'}
           {freeSpots}
         </Text>
         <Text style={styles.age}>{age} min ago</Text>
       </View>
     );
   };
   
   const styles = StyleSheet.create({
     card: {
       backgroundColor: '#ffffff',
       borderRadius: 12,
       padding: 16,
       alignItems: 'center',
       shadowColor: '#000',
       shadowOffset: { width: 0, height: 2 },
       shadowOpacity: 0.1,
       shadowRadius: 4,
       elevation: 3
     },
     name: {
       fontSize: 16,
       fontWeight: '600',
       marginBottom: 8
     },
     spots: {
       fontSize: 48,
       fontWeight: 'bold',
       color: '#10b981'
     },
     age: {
       fontSize: 12,
       color: '#64748b',
       marginTop: 4
     }
   });
   ```

**Deliverable:** Basic UI components working in React Native

---

### Phase 3: Data Layer Integration (Week 3)

**Goals:**
- Integrate shared Zustand store
- Implement AsyncStorage for caching
- Connect API layer

**Tasks:**

1. **Storage Adapter**
   ```typescript
   // packages/shared/src/storage/adapter.ts
   export interface StorageAdapter {
     getItem(key: string): Promise<string | null>;
     setItem(key: string, value: string): Promise<void>;
     removeItem(key: string): Promise<void>;
   }
   
   // Web implementation
   export class WebStorageAdapter implements StorageAdapter {
     async getItem(key: string) {
       return localStorage.getItem(key);
     }
     
     async setItem(key: string, value: string) {
       localStorage.setItem(key, value);
     }
     
     async removeItem(key: string) {
       localStorage.removeItem(key);
     }
   }
   
   // Mobile implementation
   import AsyncStorage from '@react-native-async-storage/async-storage';
   
   export class MobileStorageAdapter implements StorageAdapter {
     async getItem(key: string) {
       return AsyncStorage.getItem(key);
     }
     
     async setItem(key: string, value: string) {
       return AsyncStorage.setItem(key, value);
     }
     
     async removeItem(key: string) {
       return AsyncStorage.removeItem(key);
     }
   }
   ```

2. **Update Store to Use Adapter**
   ```typescript
   // packages/shared/src/store/parkingStore.ts
   import { create } from 'zustand';
   import type { StorageAdapter } from '../storage/adapter';
   
   export const createParkingStore = (storage: StorageAdapter) => {
     return create((set) => ({
       // ... existing store logic
       
       async loadCache() {
         const cached = await storage.getItem('parking_realtime_cache');
         if (cached) {
           const data = JSON.parse(cached);
           set({ realtimeData: data.data });
         }
       },
       
       async saveCache(data: any) {
         await storage.setItem('parking_realtime_cache', JSON.stringify(data));
       }
     }));
   };
   ```

3. **API Service (No CORS Proxy Needed!)**
   ```typescript
   // packages/shared/src/api/parkingApi.ts
   const API_URLS = [
     'https://gd.zaparkuj.pl/api/freegroupcountervalue.json',
     'https://gd.zaparkuj.pl/api/freegroupcountervalue-green.json'
   ];
   
   export async function fetchParkingData() {
     // Mobile doesn't need CORS proxy!
     const results = await Promise.all(
       API_URLS.map(url => 
         fetch(url).then(r => r.json())
       )
     );
     return results;
   }
   ```

**Deliverable:** Working data flow with caching

---

### Phase 4: Dashboard Screen (Week 4)

**Goals:**
- Complete Dashboard screen
- Implement pull-to-refresh
- Add loading states

**Tasks:**

1. **Dashboard Screen**
   ```typescript
   // packages/mobile/src/screens/DashboardScreen.tsx
   import { View, ScrollView, RefreshControl } from 'react-native';
   import { useParkingStore } from '@free-parking/shared';
   
   export const DashboardScreen = () => {
     const { realtimeData, fetchRealtimeData, realtimeLoading } = useParkingStore();
     const [refreshing, setRefreshing] = useState(false);
     
     const onRefresh = async () => {
       setRefreshing(true);
       await fetchRealtimeData();
       setRefreshing(false);
     };
     
     return (
       <ScrollView
         contentContainerStyle={styles.container}
         refreshControl={
           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
         }
       >
         <Text style={styles.title}>🅿️ Parking Monitor</Text>
         <Text style={styles.subtitle}>
           Real-time parking availability • UBS Wrocław
         </Text>
         
         <View style={styles.grid}>
           {realtimeData.map((parking, index) => (
             <ParkingCard
               key={index}
               name={parking.ParkingGroupName}
               freeSpots={parking.CurrentFreeGroupCounterValue}
               timestamp={parking.Timestamp}
             />
           ))}
         </View>
         
         <StatusPanel total={calculateTotal(realtimeData)} />
       </ScrollView>
     );
   };
   ```

2. **Pull-to-Refresh Implementation**
   - Use `RefreshControl` component
   - Show loading indicator
   - Update data on pull

3. **Status Panel Component**
   ```typescript
   // packages/mobile/src/components/StatusPanel.tsx
   export const StatusPanel = ({ total, lastUpdate, dataStatus }) => {
     return (
       <View style={styles.panel}>
         <View style={styles.section}>
           <Text style={styles.label}>Total Spaces</Text>
           <Text style={styles.value}>{total}</Text>
         </View>
         
         <View style={styles.section}>
           <Text style={styles.label}>Last Update</Text>
           <Text style={styles.time}>
             {lastUpdate.toLocaleTimeString('pl-PL')}
           </Text>
         </View>
         
         <View style={styles.section}>
           <Text style={styles.label}>Status</Text>
           <Text style={[styles.status, { color: getStatusColor(dataStatus) }]}>
             {dataStatus}
           </Text>
         </View>
       </View>
     );
   };
   ```

**Deliverable:** Fully functional Dashboard screen

---

### Phase 5: Statistics/Charts (Week 5)

**Goals:**
- Implement charts with React Native Chart Kit
- Create Statistics screen
- Add chart interactions

**Tasks:**

1. **Install Chart Dependencies**
   ```bash
   npm install --workspace=packages/mobile react-native-chart-kit react-native-svg
   ```

2. **Statistics Screen**
   ```typescript
   // packages/mobile/src/screens/StatisticsScreen.tsx
   import { LineChart } from 'react-native-chart-kit';
   import { Dimensions } from 'react-native';
   
   export const StatisticsScreen = () => {
     const { historyData } = useParkingStore();
     const screenWidth = Dimensions.get('window').width;
     
     const chartData = processHistoryData(historyData);
     
     return (
       <ScrollView style={styles.container}>
         <Text style={styles.title}>📈 Parking History</Text>
         
         <LineChart
           data={{
             labels: chartData.labels,
             datasets: [
               {
                 data: chartData.greenDay,
                 color: (opacity = 1) => `rgba(5, 255, 161, ${opacity})`,
                 strokeWidth: 2
               },
               {
                 data: chartData.uni,
                 color: (opacity = 1) => `rgba(1, 190, 255, ${opacity})`,
                 strokeWidth: 2
               }
             ],
             legend: ['GreenDay', 'Uni Wroc']
           }}
           width={screenWidth - 32}
           height={400}
           chartConfig={{
             backgroundColor: '#1e293b',
             backgroundGradientFrom: '#1e293b',
             backgroundGradientTo: '#334155',
             decimalPlaces: 0,
             color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
             labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
             style: {
               borderRadius: 16
             },
             propsForDots: {
               r: '4',
               strokeWidth: '2'
             }
           }}
           bezier
           style={styles.chart}
         />
         
         <PaletteSelector />
       </ScrollView>
     );
   };
   ```

3. **Alternative: Victory Native**
   ```typescript
   // If you need more advanced charts
   import { VictoryLine, VictoryChart, VictoryTheme } from 'victory-native';
   
   <VictoryChart theme={VictoryTheme.material}>
     <VictoryLine
       data={greenDayData}
       style={{ data: { stroke: '#05ffa1' } }}
     />
     <VictoryLine
       data={uniData}
       style={{ data: { stroke: '#01beff' } }}
     />
   </VictoryChart>
   ```

**Deliverable:** Working statistics screen with charts

---

### Phase 6: Polish & Features (Week 6)

**Goals:**
- Add animations
- Implement push notifications (optional)
- Add app icon and splash screen
- Performance optimization

**Tasks:**

1. **App Icon & Splash Screen**
   ```bash
   # Use Expo's built-in tools
   npx expo install expo-splash-screen expo-app-loading
   ```
   
   Update `app.json`:
   ```json
   {
     "expo": {
       "icon": "./assets/icon.png",
       "splash": {
         "image": "./assets/splash.png",
         "resizeMode": "contain",
         "backgroundColor": "#0f172a"
       }
     }
   }
   ```

2. **Animations with Reanimated**
   ```typescript
   import Animated, { 
     useAnimatedStyle, 
     withSpring 
   } from 'react-native-reanimated';
   
   const animatedStyle = useAnimatedStyle(() => ({
     transform: [{ scale: withSpring(pressed ? 0.95 : 1) }]
   }));
   ```

3. **Background Refresh**
   ```typescript
   import * as BackgroundFetch from 'expo-background-fetch';
   import * as TaskManager from 'expo-task-manager';
   
   const BACKGROUND_FETCH_TASK = 'background-fetch-parking';
   
   TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
     const store = useParkingStore.getState();
     await store.fetchRealtimeData();
     return BackgroundFetch.BackgroundFetchResult.NewData;
   });
   ```

4. **Performance Optimizations**
   - Use `React.memo` for list items
   - Implement `FlatList` for long lists
   - Optimize image loading
   - Use Hermes JavaScript engine (enabled by default in Expo)

**Deliverable:** Production-ready mobile app

---

## Component Mapping Strategy

### Web → Mobile Conversion Table

| Web Component | Mobile Equivalent | Approach |
|--------------|-------------------|----------|
| `<div>` | `<View>` | Direct replacement |
| `<span>`, `<p>`, `<h1>` | `<Text>` | All text in `<Text>` |
| `<button>` | `<TouchableOpacity>` or `<Pressable>` | Touch interactions |
| `<input>` | `<TextInput>` | Form inputs |
| CSS classes | StyleSheet | Convert to JS objects |
| `onClick` | `onPress` | Event handlers |
| `className` | `style` prop | Inline styles |
| `<img>` | `<Image>` | Image component |
| ScrollView (web) | `<ScrollView>` | Scrollable areas |
| Flexbox (web) | Flexbox (RN) | Similar but not identical |

### Styling Conversion

**Web CSS:**
```css
.parking-card {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
```

**React Native StyleSheet:**
```typescript
const styles = StyleSheet.create({
  parkingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // For Android
  }
});
```

### Theme Context Conversion

**Web (using CSS classes):**
```jsx
<div className={`parking-card ${theme === 'dark' ? 'dark' : ''}`}>
```

**Mobile (using theme provider):**
```typescript
const { colors } = useTheme();

<View style={[styles.parkingCard, { backgroundColor: colors.card }]}>
```

---

## Key Technical Considerations

### 1. No CORS Issues! 🎉

One major benefit: React Native doesn't have CORS restrictions. You can remove the CORS proxy:

```typescript
// Web version (needs proxy)
fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`)

// Mobile version (direct call)
fetch(url)
```

### 2. Storage Differences

| Web | Mobile | Migration Strategy |
|-----|--------|-------------------|
| `localStorage` (sync) | `AsyncStorage` (async) | Abstract with adapter pattern |
| Immediate access | Requires await | Update store methods |
| 5-10 MB limit | ~6 MB recommended | Same constraints |

### 3. Navigation Paradigm

**Web:** URLs and routes
```jsx
<Link to="/statistics">Go to Stats</Link>
```

**Mobile:** Stack-based navigation
```jsx
navigation.navigate('Statistics')
```

### 4. Charts Library Differences

**ECharts (Web):** Feature-rich, complex configuration
**React Native Chart Kit:** Simpler API, fewer features
**Victory Native:** More powerful but heavier

**Recommendation:** Start with React Native Chart Kit for MVP, migrate to Victory Native if you need advanced features.

### 5. Touch Interactions

Web click events → Mobile touch events:
```jsx
// Web
<button onClick={handleClick}>

// Mobile
<TouchableOpacity onPress={handlePress}>
```

Add touch feedback:
```jsx
<TouchableOpacity 
  activeOpacity={0.7}
  onPress={handlePress}
>
```

### 6. Safe Areas

Mobile devices have notches, status bars, home indicators:

```jsx
import { SafeAreaView } from 'react-native-safe-area-context';

<SafeAreaView style={styles.container}>
  {/* Your content */}
</SafeAreaView>
```

### 7. Platform-Specific Code

```typescript
import { Platform } from 'react-native';

const styles = StyleSheet.create({
  card: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
});
```

---

## Development Workflow

### 1. Initial Setup

```bash
# Clone repo
git clone https://github.com/yourusername/free-parking.git
cd free-parking

# Install dependencies
npm install

# Install workspace dependencies
npm install --workspaces

# Start mobile development
cd packages/mobile
npm run start
```

### 2. Development Commands

```json
// packages/mobile/package.json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "test": "jest",
    "lint": "eslint src --ext .ts,.tsx"
  }
}
```

### 3. Hot Reload

Expo provides excellent hot reload:
- Shake device to open dev menu
- Press 'r' to reload
- Press 'd' to open developer menu

### 4. Debugging

**React Native Debugger:**
```bash
brew install --cask react-native-debugger
```

**Flipper (recommended):**
- Built-in network inspector
- Layout inspector
- Redux devtools integration

**Console logs:**
```bash
npx react-native log-android
npx react-native log-ios
```

---

## Testing Strategy

### 1. Unit Tests

Share test utilities between web and mobile:

```typescript
// packages/shared/src/__tests__/parkingUtils.test.ts
import { calculateApproximation } from '../utils/parkingUtils';

describe('calculateApproximation', () => {
  it('should calculate approximated value correctly', () => {
    const staleData = {
      ParkingGroupName: 'Green Day',
      CurrentFreeGroupCounterValue: 100,
      Timestamp: '2024-01-01 10:00:00'
    };
    
    const freshData = {
      ParkingGroupName: 'Uni Wroc',
      CurrentFreeGroupCounterValue: 20,
      Timestamp: '2024-01-01 12:00:00'
    };
    
    const result = calculateApproximation(staleData, freshData);
    expect(result.isApproximated).toBe(true);
    expect(result.approximated).toBeGreaterThan(0);
  });
});
```

### 2. Component Tests

```typescript
// packages/mobile/src/components/__tests__/ParkingCard.test.tsx
import { render } from '@testing-library/react-native';
import { ParkingCard } from '../ParkingCard';

describe('ParkingCard', () => {
  it('renders parking information correctly', () => {
    const { getByText } = render(
      <ParkingCard
        name="GreenDay"
        freeSpots={150}
        age={5}
      />
    );
    
    expect(getByText('GreenDay')).toBeTruthy();
    expect(getByText('150')).toBeTruthy();
  });
});
```

### 3. Integration Tests

```typescript
// packages/mobile/src/__tests__/integration/dashboard.test.tsx
import { renderWithProviders } from '../../test-utils';
import { DashboardScreen } from '../../screens/DashboardScreen';

describe('Dashboard Integration', () => {
  it('loads and displays parking data', async () => {
    const { findByText } = renderWithProviders(<DashboardScreen />);
    
    // Wait for data to load
    const greenDay = await findByText('GreenDay');
    expect(greenDay).toBeTruthy();
  });
});
```

### 4. E2E Tests (Detox)

```bash
npm install --workspace=packages/mobile --save-dev detox
```

```typescript
// e2e/dashboard.e2e.ts
describe('Dashboard', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should show parking information', async () => {
    await expect(element(by.text('Parking Monitor'))).toBeVisible();
    await expect(element(by.text('GreenDay'))).toBeVisible();
  });

  it('should navigate to statistics', async () => {
    await element(by.text('Statistics')).tap();
    await expect(element(by.text('Parking History'))).toBeVisible();
  });
});
```

---

## Deployment Pipeline

### 1. Development Builds

```bash
# Build for iOS simulator
eas build --profile development --platform ios

# Build for Android emulator
eas build --profile development --platform android
```

### 2. EAS Build Configuration

```json
// eas.json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCDEFG123"
      },
      "android": {
        "serviceAccountKeyPath": "./path/to/key.json",
        "track": "internal"
      }
    }
  }
}
```

### 3. OTA Updates

Expo allows over-the-air updates without app store approval:

```bash
# Publish update
eas update --branch production --message "Fixed parking calculation bug"
```

### 4. CI/CD with GitHub Actions

```yaml
# .github/workflows/mobile-ci.yml
name: Mobile CI

on:
  push:
    branches: [main, develop]
    paths:
      - 'packages/mobile/**'
      - 'packages/shared/**'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install --workspaces
        
      - name: Run tests
        run: npm test --workspace=packages/mobile
        
      - name: Build
        run: eas build --platform android --profile preview --non-interactive
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
```

### 5. Release Checklist

- [ ] Update version in `app.json`
- [ ] Run full test suite
- [ ] Build production bundle
- [ ] Test on physical devices (iOS & Android)
- [ ] Update release notes
- [ ] Submit to App Store / Play Store
- [ ] Monitor crash reports

---

## Quick Start Commands

```bash
# 1. Set up monorepo structure
mkdir -p packages/{web,mobile,shared}

# 2. Initialize Expo project
cd packages/mobile
npx create-expo-app . --template blank-typescript

# 3. Set up shared package
cd ../shared
npm init -y

# 4. Configure workspaces (root package.json)
npm init -y
# Add "workspaces": ["packages/*"]

# 5. Install dependencies
cd ../..
npm install --workspaces

# 6. Start development
cd packages/mobile
npm start

# Scan QR code with Expo Go app on your phone!
```

---

## Additional Resources

### Documentation
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Native Chart Kit](https://github.com/indiespirit/react-native-chart-kit)

### Tools
- [Expo Snack](https://snack.expo.dev/) - Online playground
- [React Native Debugger](https://github.com/jhen0409/react-native-debugger)
- [Flipper](https://fbflipper.com/) - Debugging platform

### Community
- [React Native Discord](https://discord.gg/react-native)
- [Expo Forums](https://forums.expo.dev/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/react-native)

---

## Success Metrics

Track these metrics to measure conversion success:

1. **Development Time:** Target 6-8 weeks for MVP
2. **Code Reuse:** Aim for 60-70% shared business logic
3. **Performance:** 
   - App launch time < 3s
   - Screen transitions < 300ms
   - API response handling < 100ms
4. **Bundle Size:** < 20MB for production build
5. **Test Coverage:** > 80% for shared logic
6. **Crash Rate:** < 1% in production

---

## Conclusion

This conversion strategy provides a structured approach to building a React Native version of your parking monitoring app. The key principles are:

1. **Share business logic** between web and mobile
2. **Start simple** with basic UI, then add complexity
3. **Test incrementally** at each phase
4. **Leverage Expo** for rapid development
5. **Maintain parity** with web functionality while embracing mobile UX patterns

The monorepo approach will serve you well as both platforms evolve, allowing you to maintain consistency while optimizing for each platform's strengths.

Good luck with the conversion! 🚀