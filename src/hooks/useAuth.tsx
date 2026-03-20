import { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  rolesLoading: boolean;
  isAgent: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  rolesLoading: false,
  isAgent: false,
  isAdmin: false,
  isSuperAdmin: false,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [isAgent, setIsAgent] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const checkRoles = async (userId: string) => {
    setRolesLoading(true);
    try {
      const [agentRes, adminRes, superAdminRes] = await Promise.all([
        supabase.rpc("has_role", { _user_id: userId, _role: "agent" }),
        supabase.rpc("has_role", { _user_id: userId, _role: "admin" }),
        supabase.rpc("has_role", { _user_id: userId, _role: "super_admin" }),
      ]);

      const agent = !agentRes.error && !!agentRes.data;
      const admin = !adminRes.error && !!adminRes.data;
      const superAdmin = !superAdminRes.error && !!superAdminRes.data;

      setIsAgent(agent);
      setIsAdmin(admin);
      setIsSuperAdmin(superAdmin);

      return { agent, admin, superAdmin };
    } catch {
      setIsAgent(false);
      setIsAdmin(false);
      setIsSuperAdmin(false);
      return { agent: false, admin: false, superAdmin: false };
    } finally {
      setRolesLoading(false);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          checkRoles(session.user.id);
        } else {
          setRolesLoading(false);
          setIsAgent(false);
          setIsAdmin(false);
          setIsSuperAdmin(false);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkRoles(session.user.id);
      } else {
        setRolesLoading(false);
        setIsAgent(false);
        setIsAdmin(false);
        setIsSuperAdmin(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    setUser(null);
    setSession(null);
    setRolesLoading(false);
    setIsAgent(false);
    setIsAdmin(false);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, rolesLoading, isAgent, isAdmin, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
