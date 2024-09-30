import { createContext, useContext } from "react";
import { Auth, AuthInitializeConfig } from "./types";

type UnwrapPromise<P> = P extends Promise<infer R> ? R : P;
type TokenSet = UnwrapPromise<AuthInitializeConfig["initialTokens"]>
type UserData = Auth["currentUser"]
interface AuthContextProps {
  tokens?: TokenSet
  user?: UserData
  onAuthChange: ({ tokens, user}: { tokens:  NonNullable<TokenSet> | null, user: UserData }) => void
  loginWithCredentials: ({ email, password }: { email: string, password: string }) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

function useAuthContext() {
  return useContext(AuthContext);
}

export { AuthContext, useAuthContext, type AuthContextProps };
