import { registerRootComponent } from 'expo';

import 'reflect-metadata';
import '@/infrastructure/di/firebase.service';
import '@/infrastructure/di/firebase.repository';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
