import { registerRootComponent } from 'expo';
import { NativeWindStyleSheet } from 'nativewind';

import App from './App';

// Force NativeWind's internal store to "dark" *before* any component mounts.
// This guarantees `dark:` utilities resolve correctly on the first render.
NativeWindStyleSheet.setColorScheme('dark');

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
