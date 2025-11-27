import Constants from "expo-constants";
import * as AuthSession from "expo-auth-session";

const extra = (Constants.expoConfig?.extra || {}) as Record<string, any>;
const googleExtra = (extra.googleAuth || {}) as Record<string, string>;

const discovery = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
};

const userInfoEndpoint = "https://www.googleapis.com/oauth2/v3/userinfo";

const getClientId = () => {
  return (
    googleExtra.webClientId ||
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
    ""
  );
};

const getRedirectUri = () => {
  // En Expo Go, usar proxy; en standalone, usar scheme
  if (Constants.appOwnership === "expo") {
    return AuthSession.makeRedirectUri({
      native: `https://auth.expo.io/@${Constants.expoConfig?.owner}/${Constants.expoConfig?.slug}`,
    });
  }

  return AuthSession.makeRedirectUri({
    scheme: Constants.expoConfig?.scheme,
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
    const isExpoGo = Constants.appOwnership === "expo";

    console.log("[GoogleAuthService] Iniciando flujo OAuth", {
      clientIdConfigured: !!clientId,
      redirectUri,
      isExpoGo,
    });

    try {
      // Crear la request de autenticación
      const request = new AuthSession.AuthRequest({
        clientId,
        redirectUri,
        responseType: AuthSession.ResponseType.Token,
        scopes: ["openid", "profile", "email"],
        extraParams: {
          prompt: "select_account",
        },
      });

      console.log("[GoogleAuthService] AuthRequest creado, cargando...");

      // Cargar la request
      await request.makeAuthUrlAsync(discovery);

      console.log("[GoogleAuthService] AuthURL:", request.url);
      console.log("[GoogleAuthService] Abriendo navegador de autenticación...");

      // Ejecutar el flujo de autenticación
      const result = await request.promptAsync(discovery);

      console.log("[GoogleAuthService] Resultado completo:", JSON.stringify(result, null, 2));
      console.log("[GoogleAuthService] Resultado type:", result.type);

      if (result.type !== "success") {
        if (result.type !== "dismiss" && result.type !== "cancel") {
          console.warn("[GoogleAuthService] Resultado inesperado", result);
        }
        return null;
      }

      // El resultado exitoso contiene params
      const params = (result as any).params;
      if (!params?.access_token) {
        console.warn("[GoogleAuthService] No se recibió access_token");
        return null;
      }

      const token = params.id_token || params.access_token;
      console.log("[GoogleAuthService] Token obtenido, obteniendo info de usuario...");

      const userInfoResponse = await fetch(userInfoEndpoint, {
        headers: {
          Authorization: "Bearer " + params.access_token,
        },
      });

      if (!userInfoResponse.ok) {
        console.error("[GoogleAuthService] Error obteniendo userInfo:", userInfoResponse.status);
        throw new Error("Error obteniendo información del usuario");
      }

      const userInfo = await userInfoResponse.json();
      console.log("[GoogleAuthService] UserInfo obtenido:", userInfo.email);

      return {
        token,
        userInfo,
      };
    } catch (error: any) {
      console.error("[GoogleAuthService] Error en flujo OAuth:", error);
      console.error("[GoogleAuthService] Error mensaje:", error?.message);
      console.error("[GoogleAuthService] Error stack:", error?.stack);
      throw new Error("Error en autenticación con Google: " + (error?.message || "Desconocido"));
    }
  },
};
