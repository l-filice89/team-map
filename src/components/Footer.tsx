import { appName, showInternalToolLabel } from "@/config/app";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-6">
        <p className="text-center text-sm text-muted-foreground">
          © {currentYear} {appName}.
          {showInternalToolLabel ? " Internal tool." : " Team map."}
        </p>
      </div>
    </footer>
  );
}
