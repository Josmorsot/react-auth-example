import { useCallback, useMemo, useState } from "react";
import { useApiFetcher } from "../api";
import { AuthContextProps } from "./useAuthContext";

function useTokens() {
  const [tokens, setTokens] = useState<AuthContextProps["tokens"]>();

  const fetcher = useApiFetcher();
  const getFreshToken = useCallback(
    async (refreshToken: string) => {
      const tokensResponse = await fetcher("POST /v3/auth/refresh", { data: { refreshToken } });
      if (!tokensResponse.ok) {
        throw new Error(tokensResponse.data.message);
      }

      return {
        access: tokensResponse.data.accessToken,
        refresh: tokensResponse.data.refreshToken,
        accessExpiresAt: tokensResponse.data.accessTokenExpiresAt,
        refreshExpiresAt: tokensResponse.data.refreshTokenExpiresAt,
      };
    },
    [fetcher]
  );

  const getTokenWithCredentials = useCallback(
    async (credentials: { email: string; password: string }) => {
      const tokensResponse = await fetcher("POST /v3/auth/login", { data: credentials });
      if (!tokensResponse.ok) {
        throw new Error(tokensResponse.data.message);
      }

      return {
        access: tokensResponse.data.accessToken,
        refresh: tokensResponse.data.refreshToken,
        accessExpiresAt: tokensResponse.data.accessTokenExpiresAt,
        refreshExpiresAt: tokensResponse.data.refreshTokenExpiresAt,
      };
    },
    [fetcher]
  );

  const hasExpired = useMemo(() => {
    if (!tokens) return true;

    return new Date(tokens.accessExpiresAt) < new Date();
  }, [tokens]);

  return {
    tokens,
    hasExpired,
    updateTokens: setTokens,
    refresh: getFreshToken,
    getTokenWithCredentials,
  };
}

export default useTokens;
