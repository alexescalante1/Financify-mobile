import Constants from "expo-constants";
import * as AuthSession from "expo-auth-session";

const extra = (Constants.expoConfig?.extra || {}) as Record<string, any>;
const googleExtra = (extra.googleAuth || {}) as Record<string, string>;

const discovery = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
  revocationEndpoint: "https://oauth2.googleapis.com/revoke",
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
  const scheme = Constants.expoConfig?.scheme;
  
  return AuthSession.makeRedirectUri({
    scheme: Array.isArray(scheme) ? scheme[0] : scheme,
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
    });

    try {
      // Crear la request de autenticación
      const request = new AuthSession.AuthRequest({
        clientId,
        redirectUri,
        responseType: AuthSession.ResponseType.Code,
        scopes: ["openid", "profile", "email"],
        usePKCE: true,
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

      console.log("[GoogleAuthService] Resultado type:", result.type);

      if (result.type !== "success") {
        if (result.type !== "dismiss" && result.type !== "cancel") {
          console.warn("[GoogleAuthService] Resultado inesperado", result);
        }
        return null;
      }

      // Extraer y validar el código de autorización
      const code = Array.isArray(result.params.code)
        ? result.params.code[0]
        : result.params.code;

      if (!code) {
        console.error("[GoogleAuthService] No se recibió código de autorización");
        return null;
      }

      console.log("[GoogleAuthService] Código recibido, intercambiando por tokens...");

      // Intercambiar el código por tokens
      const tokenResponse = await AuthSession.exchangeCodeAsync(
        {
          clientId,
          code,
          redirectUri,
          extraParams: {
            code_verifier: request.codeVerifier || "",
          },
        },
        discovery
      );

      console.log("[GoogleAuthService] Tokens obtenidos, obteniendo info de usuario...");

      // Obtener información del usuario
      const userInfoResponse = await fetch(userInfoEndpoint, {
        headers: {
          Authorization: `Bearer ${tokenResponse.accessToken}`,
        },
      });

      if (!userInfoResponse.ok) {
        console.error(
          "[GoogleAuthService] Error obteniendo userInfo:",
          userInfoResponse.status
        );
        throw new Error("Error obteniendo información del usuario");
      }

      const userInfo = await userInfoResponse.json();
      console.log("[GoogleAuthService] UserInfo obtenido:", userInfo.email);

      return {
        token: tokenResponse.idToken || tokenResponse.accessToken,
        userInfo,
      };
    } catch (error: any) {
      console.error("[GoogleAuthService] Error en flujo OAuth:", error);
      console.error("[GoogleAuthService] Error mensaje:", error?.message);
      throw new Error(
        "Error en autenticación con Google: " + (error?.message || "Desconocido")
      );
    }
  },
};