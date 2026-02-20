import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { allowedDomains, getDomainRestrictionMessage } from "@/config/app";

interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string;
}

interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  loading: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const validateDomain = (email: string | undefined): boolean => {
    if (!email) return false;
    if (allowedDomains.length === 0) return false;
    return allowedDomains.some((domain) =>
      email.toLowerCase().endsWith(`@${domain}`)
    );
  };

  const createUserProfile = async (authUser: User): Promise<UserProfile> => {
    // Fetch user data from users table to get avatar_url
    const { data: userData } = await supabase
      .from("users")
      .select("avatar_url")
      .eq("id", authUser.id)
      .single();

    return {
      id: authUser.id,
      email: authUser.email || "",
      displayName:
        authUser.user_metadata?.full_name ||
        authUser.user_metadata?.name ||
        authUser.email?.split("@")[0] ||
        "User",
      avatarUrl:
        userData?.avatar_url ||
        authUser.user_metadata?.avatar_url ||
        authUser.user_metadata?.picture ||
        "",
    };
  };

  useEffect(() => {
    // Set up auth listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);

      if (currentSession?.user) {
        const email = currentSession.user.email;

        // Enforce domain restriction
        if (!validateDomain(email)) {
          setAuthError(getDomainRestrictionMessage());
          setUser(null);
          // Sign out using setTimeout to avoid recursion
          setTimeout(() => {
            supabase.auth.signOut();
          }, 0);
        } else {
          setAuthError(null);
          // Defer profile fetch to avoid blocking
          setTimeout(() => {
            createUserProfile(currentSession.user).then(setUser);
          }, 0);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    // THEN check for existing session
    supabase.auth
      .getSession()
      .then(async ({ data: { session: currentSession } }) => {
        setSession(currentSession);

        if (currentSession?.user) {
          const email = currentSession.user.email;

          if (!validateDomain(email)) {
            setAuthError(getDomainRestrictionMessage());
            setUser(null);
            setTimeout(() => {
              supabase.auth.signOut();
            }, 0);
          } else {
            setAuthError(null);
            const profile = await createUserProfile(currentSession.user);
            setUser(profile);
          }
        }

        setLoading(false);
      });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setAuthError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/signin?from=/app`,
      },
    });

    if (error) {
      setAuthError(error.message);
      return { error };
    }

    return { error: null };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      setAuthError(error.message);
    } else {
      setUser(null);
      setSession(null);
      setAuthError(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, session, loading, authError, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
