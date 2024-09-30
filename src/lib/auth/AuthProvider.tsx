import { ReactNode, useCallback, useEffect } from "react";
import { AuthInitializeConfig } from "./types";
import { AuthContext, AuthContextProps } from "./useAuthContext";
import useTokens from "./useTokens";
import useUser from "./useUser";

interface AuthProviderProps extends AuthInitializeConfig {
  children?: ReactNode;

  /**
   * @see {@link AuthInitializeConfig.initialTokens}
   */
  initialTokens?: AuthInitializeConfig["initialTokens"];

  /**
   * @see {@link AuthInitializeConfig.onAuthChange}
   */
  onAuthChange?: AuthInitializeConfig["onAuthChange"];
}

/**
 * Initializes the auth state and exposes it to the component-tree below.
 *
 * This allow separate calls of `useAuth` to communicate among each-other and share
 * a single source of truth.
 */
function AuthProvider(props: AuthProviderProps): JSX.Element {
  const { initialTokens, onAuthChange: onTokensChange, ...otherProps } = props;
  const { tokens, hasExpired, updateTokens, getTokenWithCredentials, refresh } = useTokens();
  const { user, updateUser, getUser } = useUser();

  const onAuthChange: AuthContextProps["onAuthChange"] = useCallback(
    ({ tokens, user }) => {
      updateTokens(tokens);
      updateUser(user);
      onTokensChange?.(tokens);
    },
    [onTokensChange, updateTokens, updateUser]
  );

  const logout = useCallback(() => {
    onAuthChange({ tokens: null, user: null });
    return Promise.resolve();
  }, [onAuthChange]);

  const loginWithCredentials = useCallback(
    async (credentials: { email: string; password: string }) => {
      const tokenSet = await getTokenWithCredentials(credentials);
      const user = await getUser(tokenSet.access);
      onAuthChange({ tokens: tokenSet, user });
    },
    [onAuthChange, getTokenWithCredentials, getUser]
  );

  useEffect(() => {
    const getInitialTokens = async () => {
      const tokens = await initialTokens;
      updateTokens(tokens);

      if (!tokens) {
        updateUser(null);
      }
    };

    getInitialTokens().catch(() => {
      console.error("An error has occurred");
    });
  }, [initialTokens, updateTokens, updateUser]);

  useEffect(() => {
    if (tokens && hasExpired) {
      refresh(tokens.refresh)
        .then((tokens) => {
          onAuthChange({ tokens, user: undefined });
        })
        .catch(logout);
    } else if (tokens && !user) {
      getUser(tokens.access)
        .then((user) => {
          onAuthChange({ tokens, user });
        })
        .catch(logout);
    }
  }, [getUser, logout, onAuthChange, refresh, tokens, user, hasExpired]);

  const value = {
    tokens,
    user,
    onAuthChange,
    logout,
    loginWithCredentials,
  };

  return <AuthContext.Provider value={value} {...otherProps} />;
}

export { AuthProvider, type AuthProviderProps };
