import { injectable } from 'tsyringe';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { INetworkRepository, NetworkState } from '@/domain/repository/INetworkRepository';

const CONNECTIVITY_CHECK_URL = 'https://clients3.google.com/generate_204';

@injectable()
export class NetworkRepositoryImpl implements INetworkRepository {
  async getNetworkState(): Promise<NetworkState> {
    const state = await NetInfo.fetch();
    return this.mapState(state);
  }

  subscribe(callback: (state: NetworkState) => void): () => void {
    return NetInfo.addEventListener((state) => {
      callback(this.mapState(state));
    });
  }

  async validateInternetAccess(): Promise<boolean> {
    try {
      const response = await fetch(CONNECTIVITY_CHECK_URL, {
        method: 'GET',
        cache: 'no-cache',
      });
      return response.status === 204;
    } catch {
      return false;
    }
  }

  private mapState(state: NetInfoState): NetworkState {
    return {
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable,
      type: state.type,
    };
  }
}
