import Constants from "expo-constants";
import * as AuthSession from "expo-auth-session";

const extra = (Constants.expoConfig?.extra || {}) as Record<string, any>;
const googleExtra = (extra.googleAuth || {}) as Record<string, string>;

const authorizationEndpoint = "https://accounts.google.com/o/oauth2/v2/auth";
const userInfoEndpoint = "https://www.googleapis.com/oauth2/v3/userinfo";

const getClientId = () => {
  return (
    googleExtra.webClientId ||
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
    ""
  );
};

const useProxy = Constants.appOwnership === "expo";

const getProxyRedirectUri = () => {
  const owner =
    Constants.expoConfig?.owner ||
    (extra?.expoClient as any)?.owner ||
    extra?.owner;
  const slug = Constants.expoConfig?.slug;

  if (owner && slug) {
    return `https://auth.expo.io/@${owner}/${slug}`;
  }

  return AuthSession.makeRedirectUri({ useProxy: true });
};

const getRedirectUri = () => {
  if (useProxy) {
    return getProxyRedirectUri();
  }

  return AuthSession.makeRedirectUri({
    scheme: Constants.expoConfig?.scheme,
    useProxy: false,
  });
};

export interface GoogleAuthResult {
  token: string;
  userInfo: any;
}

export const GoogleAuthService = {
  async signIn(): Promise<GoogleAuthResult | null> {
    const clientId = getClientId();

    if (!clientId) {
      console.warn(
        "[GoogleAuthService] Falta configurar googleAuth.webClientId o EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID"
      );
      return null;
    }

    const redirectUri = getRedirectUri();
    console.log("[GoogleAuthService] Iniciando flujo OAuth", {
      clientIdConfigured: !!clientId,
      redirectUri,
      useProxy,
    });

    const queryParams = new URLSearchParams({
      response_type: "token id_token",
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: "openid profile email",
      prompt: "select_account",
    });

    const authUrl = authorizationEndpoint + "?" + queryParams.toString();
    console.log("[GoogleAuthService] authUrl construido", authUrl);

    const result = await AuthSession.startAsync(
      useProxy
        ? { authUrl }
        : {
            authUrl,
            returnUrl: redirectUri,
          }
    );
    console.log("[GoogleAuthService] Resultado AuthSession", result.type);

    if (result.type !== "success" || !result.params?.access_token) {
      if (result.type !== "dismiss") {
        console.warn("[GoogleAuthService] Resultado inesperado", result);
        console.warn("[GoogleAuthService] Resultado OAuth:", result.type);
      }
      return null;
    }

    const token = result.params.id_token || result.params.access_token;

    const userInfoResponse = await fetch(userInfoEndpoint, {
      headers: {
        Authorization: "Bearer " + result.params.access_token,
      },
    });

    const userInfo = await userInfoResponse.json();

    return {
      token,
      userInfo,
    };
  },
};
