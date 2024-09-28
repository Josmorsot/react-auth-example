import { ReactNode, useEffect, useState } from "react";
import { AuthInitializeConfig } from "./types";
import { AuthContext, AuthContextProps } from "./useAuthContext";

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
  const [tokens, setTokens] = useState<AuthContextProps["tokens"]>();
  const [user, setUser] = useState<AuthContextProps["user"]>();

  const onAuthChange: AuthContextProps["onAuthChange"] = ({ tokens, user }) => {
    setTokens(tokens);
    setUser(user);
    onTokensChange?.(tokens);
  };

  useEffect(() => {
    const getInitialTokens = async () => {
      const tokens = await initialTokens;
      setTokens(tokens);

      if (!tokens) {
        setUser(null);
      }
    };

    getInitialTokens().catch(() => {
      console.error("An error has occurred");
    });
  }, [initialTokens]);

  const value = {
    tokens,
    user,
    onAuthChange,
  };

  return <AuthContext.Provider value={value} {...otherProps} />;
}

export { AuthProvider, type AuthProviderProps };
