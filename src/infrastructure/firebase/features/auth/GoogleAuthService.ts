import { injectable } from 'tsyringe';
import Constants from "expo-constants";
import * as AuthSession from "expo-auth-session";
import { GoogleUserInfo } from "@/domain/types/GoogleUserInfo";

const extra = (Constants.expoConfig?.extra || {}) as Record<string, unknown>;
const googleExtra = (extra.googleAuth || {}) as Record<string, string>;

const discovery = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
  revocationEndpoint: "https://oauth2.googleapis.com/revoke",
};

const userInfoEndpoint = "https://www.googleapis.com/oauth2/v3/userinfo";

export interface GoogleAuthResult {
  token: string;
  userInfo: GoogleUserInfo;
}

@injectable()
export class GoogleAuthService {
  private getClientId(): string {
    return (
      googleExtra.webClientId ||
      process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
      ""
    );
  }

  private getRedirectUri(): string {
    const scheme = Constants.expoConfig?.scheme;
    return AuthSession.makeRedirectUri({
      scheme: Array.isArray(scheme) ? scheme[0] : scheme,
    });
  }

  async signIn(): Promise<GoogleAuthResult | null> {
    const clientId = this.getClientId();

    if (!clientId) {
      return null;
    }

    const redirectUri = this.getRedirectUri();

    try {
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

      await request.makeAuthUrlAsync(discovery);

      const result = await request.promptAsync(discovery);

      if (result.type !== "success") {
        return null;
      }

      const code = Array.isArray(result.params.code)
        ? result.params.code[0]
        : result.params.code;

      if (!code) {
        return null;
      }

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

      const userInfoResponse = await fetch(userInfoEndpoint, {
        headers: {
          Authorization: `Bearer ${tokenResponse.accessToken}`,
        },
      });

      if (!userInfoResponse.ok) {
        throw new Error("Error obteniendo informacion del usuario");
      }

      const userInfo: GoogleUserInfo = await userInfoResponse.json();

      return {
        token: tokenResponse.idToken || tokenResponse.accessToken,
        userInfo,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Desconocido";
      throw new Error("Error en autenticacion con Google: " + message);
    }
  }
}
