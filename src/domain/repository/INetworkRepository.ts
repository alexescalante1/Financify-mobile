export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string | null;
}

export interface INetworkRepository {
  getNetworkState(): Promise<NetworkState>;
  subscribe(callback: (state: NetworkState) => void): () => void;
  validateInternetAccess(): Promise<boolean>;
}
