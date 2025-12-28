import 'react-native-url-polyfill/auto';
import { registerRootComponent } from 'expo';
import App from './src/AppMinimal';

// Hermes on Android doesn't expose SharedArrayBuffer; stub to satisfy libs that probe it
if (typeof global.SharedArrayBuffer === 'undefined') {
	global.SharedArrayBuffer = ArrayBuffer;
}

// Register the root component
registerRootComponent(App);
