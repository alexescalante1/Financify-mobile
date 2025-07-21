import { container } from 'tsyringe';

import IFirebaseFirestoreService from '@/domain/interfaces/service/IFirebaseFirestoreService';
import FirebaseFirestoreService from '@/infrastructure/firebase/service/FirebaseFirestoreService';

import IFirebaseRealtimeService from '@/domain/interfaces/service/IFirebaseRealtimeService';
import FirebaseRealtimeService from '@/infrastructure/firebase/service/FirebaseRealtimeService';

import IFirebaseStorageService from '@/domain/interfaces/service/IFirebaseStorageService';
import FirebaseStorageService from '@/infrastructure/firebase/service/FirebaseStorageService';

container.registerSingleton<IFirebaseFirestoreService>('IFirebaseFirestoreService', FirebaseFirestoreService);
container.registerSingleton<IFirebaseRealtimeService>('IFirebaseRealtimeService', FirebaseRealtimeService);
container.registerSingleton<IFirebaseStorageService>('IFirebaseStorageService', FirebaseStorageService);