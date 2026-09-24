import { createContext, useContext, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser, login as loginApi, logout as logoutApi } from "../api/users";
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const { data: currentUser, isLoading, isError } = useQuery({ queryKey: ["currentUser"], queryFn: getCurrentUser, retry: false, staleTime: 60_000 });
  useEffect(() => { const sync = () => { setUser(null); queryClient.setQueryData(["currentUser"], null); }; window.addEventListener("vidtube:unauthorized", sync); return () => window.removeEventListener("vidtube:unauthorized", sync); }, [queryClient]);
  useEffect(() => { if (currentUser) setUser(currentUser); }, [currentUser]);
  const login = async (data) => { const result = await loginApi(data); setUser(result.user); queryClient.setQueryData(["currentUser"], result.user); return result.user; };
  const logout = async () => { try { await logoutApi(); } finally { setUser(null); queryClient.clear(); } };
  return <AuthContext.Provider value={{ user, setUser, login, logout, loading: isLoading && !isError }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
