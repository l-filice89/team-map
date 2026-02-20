import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { appName, logoUrl, getDomainRestrictionMessage, getSignInPrompt, showInternalToolLabel } from "@/config/app";

export default function SignIn() {
  const { user, authError, signInWithGoogle } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const from = searchParams.get("from") || "/app";
  const errorParam = searchParams.get("error");

  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, from, navigate]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setLocalError(null);

    const { error } = await signInWithGoogle();

    if (error) {
      setLocalError(error.message);
      setLoading(false);
    }
    // Note: setLoading(false) not needed on success as page will redirect
  };

  const showError = authError || localError || errorParam === "domain";
  const errorMessage = authError || localError || getDomainRestrictionMessage();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <img
            src={logoUrl}
            alt={`${appName} logo`}
            className="h-16 mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome
          </h1>
          <p className="text-muted-foreground">
            {getSignInPrompt()}
          </p>
        </div>

        {showError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleGoogleSignIn}
          className="w-full"
          size="lg"
          disabled={loading}
        >
          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {loading ? "Redirecting..." : "Continue with Google"}
        </Button>

        {showInternalToolLabel && (
          <p className="text-center text-sm text-muted-foreground">
            Internal tool for team members only
          </p>
        )}
      </div>
    </div>
  );
}
