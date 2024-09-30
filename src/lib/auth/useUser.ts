import { useCallback, useState } from "react";
import { useApiFetcher } from "../api";
import { AuthContextProps } from "./useAuthContext";

function useUser() {
  const [user, setUser] = useState<AuthContextProps["user"]>();
  const fetcher = useApiFetcher();
  const getUser = useCallback(
    async (accessToken?: string) => {
      const userResponse = await fetcher(
        "GET /v1/users/me",
        {},
        accessToken ? { headers: { authorization: `Bearer ${accessToken}` } } : undefined
      );
      if (!userResponse.ok) {
        throw new Error(userResponse.data.message);
      }

      return {
        name: userResponse.data.displayName,
        email: userResponse.data.email ?? "-",
        userId: userResponse.data.userId,
      };
    },
    [fetcher]
  );

  return {
    user,
    updateUser: setUser,
    getUser,
  };
}

export default useUser;
