import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Auth, AuthInitializeConfig } from "./types";

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
type UnwrapPromise<P> = P extends Promise<infer R> ? R : P;
type TokenSet = UnwrapPromise<AuthProviderProps["initialTokens"]>
type UserData = Auth["currentUser"]
interface AuthContextProps {
  tokens?: TokenSet
  user?: UserData
  onAuthChange: ({ tokens, user}: { tokens:  NonNullable<TokenSet> | null, user: UserData }) => void
}


const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

const useAuthContext = () => {
  return useContext(AuthContext);
};

/**
 * Initializes the auth state and exposes it to the component-tree below.
 *
 * This allow separate calls of `useAuth` to communicate among each-other and share
 * a single source of truth.
 */
function AuthProvider(props: AuthProviderProps): JSX.Element {
  const { initialTokens, onAuthChange: onTokensChange, ...otherProps } = props;
  const [tokens, setTokens] = useState<UnwrapPromise<typeof initialTokens>>();
  const [user, setUser] = useState<UserData>()

  const onAuthChange: AuthContextProps["onAuthChange"] = ({ tokens, user }) => {
    setTokens(tokens)
    setUser(user)
    onTokensChange?.(tokens);
  };

  useEffect(() => {
    const getInitialTokens = async () => {
      const tokens = await initialTokens;
      setTokens(tokens);
      
      if (!tokens) {
        setUser(null)
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

export { AuthProvider, type AuthProviderProps, useAuthContext };
