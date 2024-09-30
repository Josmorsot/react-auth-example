import { Auth } from "./types";
import { useAuthContext } from "./useAuthContext";


/**
 * Returns the current auth state. See {@link Auth} for more information on
 * what is included there.
 *
 * @throws {TypeError} if called from a component not descendant of AuthProvider
 */
function useAuth(): Auth {
  const { tokens, user, loginWithCredentials, logout } = useAuthContext();

  return {
    tokens,
    currentUser: user,
    async login(credentials) {
      try {
        await loginWithCredentials(credentials)
      } catch (error) {
        return Promise.reject(error as Error);
      }
    },
    logout
  };
}

export { useAuth };
