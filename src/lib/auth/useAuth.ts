/* eslint-disable @typescript-eslint/no-explicit-any */
import { Auth } from "./types";
import { useAuthContext } from "./AuthProvider";
import { useApiFetcher } from "../api";
import { useCallback, useEffect } from "react";

/**
 * Returns the current auth state. See {@link Auth} for more information on
 * what is included there.
 *
 * @throws {TypeError} if called from a component not descendant of AuthProvider
 */
function useAuth(): Auth {
  const fetcher = useApiFetcher();
  const { tokens, user, onAuthChange } = useAuthContext();

  const getUser = useCallback(async (accessToken?: string) => {
    const userResponse = await fetcher(
      "GET /v1/users/me",
      {},
      accessToken ? { headers: { authorization: `Bearer ${accessToken}` } } : undefined
    );
    if (!userResponse.ok) {
      throw new Error(userResponse.data.message)
    }

    return {
      name: userResponse.data.displayName,
      email: userResponse.data.email ?? "-",
      userId: userResponse.data.userId,
    };
  }, [fetcher]);

  const getTokenWithCredentials = async (credentials: { email: string, password: string}) => {
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
  }

  useEffect(() => {
    if (tokens && !user) {
      getUser(tokens.access).then((user) => { // TODO: Re-check why `defaultHeaders` is not working properly
        onAuthChange({ tokens, user })
      }).catch((reason) => {
        // TODO
        console.error(reason)
      })
    }
  }, [getUser, tokens, user, onAuthChange]);

  return {
    tokens,
    currentUser: user,
    async login(credentials) {
      try {
        const tokenSet = await getTokenWithCredentials(credentials)
        const user = await getUser(tokenSet.access)
        
        onAuthChange({ tokens: tokenSet, user });
      } catch (error) {
        return Promise.reject(error as Error)
      }

    },
    logout() {
      onAuthChange({ tokens: null, user: null });
      return Promise.resolve()
    },
  };
}

export { useAuth };
