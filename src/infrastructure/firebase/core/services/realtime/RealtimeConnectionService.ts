import { injectable, inject } from 'tsyringe';
import { DI_TOKENS } from '@/domain/di/tokens';
import {
  ref,
  get,
  set,
  onValue,
  onDisconnect,
  goOffline,
  goOnline,
  serverTimestamp,
  Database,
  Unsubscribe,
} from "firebase/database";
import { ConnectionState, PresenceInfo } from "./RealtimeTypes";

@injectable()
export class RealtimeConnectionService {
  constructor(@inject(DI_TOKENS.RealtimeDbInstance) private readonly rtdb: Database) {}

  async getConnectionState(): Promise<ConnectionState> {
    try {
      const connectedRef = ref(this.rtdb, ".info/connected");
      const offsetRef = ref(this.rtdb, ".info/serverTimeOffset");

      const [connectedSnapshot, offsetSnapshot] = await Promise.all([
        get(connectedRef),
        get(offsetRef),
      ]);

      return {
        connected: connectedSnapshot.val() === true,
        serverTimeOffset: offsetSnapshot.val() || 0,
      };
    } catch (error) {
      return { connected: false, serverTimeOffset: 0 };
    }
  }

  listenToConnectionState(
    callback: (state: ConnectionState) => void
  ): Unsubscribe {
    const connectedRef = ref(this.rtdb, ".info/connected");
    const offsetRef = ref(this.rtdb, ".info/serverTimeOffset");

    let connected = false;
    let serverTimeOffset = 0;

    const connectedUnsubscribe = onValue(connectedRef, (snapshot) => {
      connected = snapshot.val() === true;
      callback({ connected, serverTimeOffset });
    });

    const offsetUnsubscribe = onValue(offsetRef, (snapshot) => {
      serverTimeOffset = snapshot.val() || 0;
      callback({ connected, serverTimeOffset });
    });

    return () => {
      connectedUnsubscribe();
      offsetUnsubscribe();
    };
  }

  async getServerTimestamp(): Promise<number> {
    try {
      const offsetRef = ref(this.rtdb, ".info/serverTimeOffset");
      const offsetSnapshot = await get(offsetRef);
      const offset = offsetSnapshot.val() || 0;
      return Date.now() + offset;
    } catch (error) {
      return Date.now();
    }
  }

  async setUserPresence(userId: string, presenceData: Record<string, unknown>): Promise<boolean> {
    try {
      const userPresenceRef = ref(this.rtdb, `presence/users/${userId}`);
      const userConnectionRef = ref(this.rtdb, `presence/connections/${userId}`);

      const presenceInfo = {
        ...presenceData,
        isOnline: true,
        lastSeen: serverTimestamp(),
        connectedAt: serverTimestamp(),
      };

      const disconnectRef = onDisconnect(userPresenceRef);
      await disconnectRef.set({
        ...presenceData,
        isOnline: false,
        lastSeen: serverTimestamp(),
      });

      const connectionDisconnectRef = onDisconnect(userConnectionRef);
      await connectionDisconnectRef.remove();

      await set(userPresenceRef, presenceInfo);
      await set(userConnectionRef, true);

      return true;
    } catch (error) {
      return false;
    }
  }

  listenToUserPresence(
    userId: string,
    callback: (presence: PresenceInfo) => void
  ): Unsubscribe {
    const userPresenceRef = ref(this.rtdb, `presence/users/${userId}`);
    const connectionsRef = ref(this.rtdb, `presence/connections`);

    let userPresence: Record<string, unknown> = {};
    let connections: unknown = {};

    const presenceUnsubscribe = onValue(userPresenceRef, (snapshot) => {
      userPresence = (snapshot.val() as Record<string, unknown>) || {};
      callback({
        isOnline: (userPresence.isOnline as boolean) || false,
        lastSeen: (userPresence.lastSeen as number) || 0,
        connections,
      });
    });

    const connectionsUnsubscribe = onValue(connectionsRef, (snapshot) => {
      connections = snapshot.val() || {};
      callback({
        isOnline: (userPresence.isOnline as boolean) || false,
        lastSeen: (userPresence.lastSeen as number) || 0,
        connections,
      });
    });

    return () => {
      presenceUnsubscribe();
      connectionsUnsubscribe();
    };
  }

  async getOnlineUsers(
    path: string,
    getDataByPath: (path: string) => Promise<unknown>
  ): Promise<string[]> {
    try {
      const data = await getDataByPath(path);
      if (!data) {
        return [];
      }

      const record = data as Record<string, Record<string, unknown>>;
      return Object.keys(record).filter((userId) => {
        const userData = record[userId];
        return userData && userData.isOnline === true;
      });
    } catch (error) {
      return [];
    }
  }

  listenToOnlineUsers(
    path: string,
    callback: (users: string[]) => void,
    listenToPath: (path: string, cb: (data: unknown, snapshot: any) => void) => Unsubscribe
  ): Unsubscribe {
    return listenToPath(path, (data) => {
      if (!data) {
        callback([]);
        return;
      }

      const record = data as Record<string, Record<string, unknown>>;
      const onlineUsers = Object.keys(record).filter((userId) => {
        const userData = record[userId];
        return userData && userData.isOnline === true;
      });

      callback(onlineUsers);
    });
  }

  async clearCache(): Promise<boolean> {
    try {
      goOffline(this.rtdb);
      await new Promise((resolve) => setTimeout(resolve, 100));
      goOnline(this.rtdb);
      return true;
    } catch (error) {
      return false;
    }
  }

  async setPersistenceEnabled(enabled: boolean): Promise<boolean> {
    try {
      return true;
    } catch (error) {
      return false;
    }
  }
}
