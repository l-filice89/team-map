/**
 * App config from environment. Single source of truth for branding and auth.
 * All VITE_* vars are exposed at build time; see .env.example.
 */

const raw = import.meta.env;

function parseAllowedDomains(value: string | undefined): string[] {
  if (!value || typeof value !== "string") return [];
  return value
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);
}

function parseBoolean(value: string | undefined): boolean {
  if (value === undefined || value === "") return false;
  return value.toLowerCase() === "true" || value === "1";
}

function slug(name: string): string {
  return name
    .replace(/\s+/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 20) || "app";
}

export const appName =
  (typeof raw.VITE_APP_NAME === "string" && raw.VITE_APP_NAME.trim()) ||
  "Team Map";

export const allowedDomains = parseAllowedDomains(
  raw.VITE_ALLOWED_EMAIL_DOMAINS as string | undefined
);

export const logoUrl =
  (typeof raw.VITE_LOGO_URL === "string" && raw.VITE_LOGO_URL.trim()) ||
  "/logo.svg";

export const faviconUrl =
  (typeof raw.VITE_FAVICON_URL === "string" && raw.VITE_FAVICON_URL.trim()) ||
  "/logo.svg";

export const showInternalToolLabel = parseBoolean(
  raw.VITE_SHOW_INTERNAL_TOOL_LABEL as string | undefined
);

export const themeStorageKey = `${slug(appName)}-theme`;

export function getDomainRestrictionMessage(): string {
  if (allowedDomains.length === 0) {
    return "Sign-in is restricted. Contact your administrator.";
  }
  if (allowedDomains.length === 1) {
    return `Only @${allowedDomains[0]} accounts are allowed.`;
  }
  const last = allowedDomains[allowedDomains.length - 1];
  const rest = allowedDomains.slice(0, -1);
  const list = rest.map((d) => `@${d}`).join(", ") + " and @" + last;
  return `Only ${list} accounts are allowed.`;
}

/** Short sign-in prompt for landing/sign-in page. */
export function getSignInPrompt(): string {
  if (allowedDomains.length === 0) {
    return "Sign in with your work email.";
  }
  if (allowedDomains.length === 1) {
    return `Sign in with your @${allowedDomains[0]} email.`;
  }
  const list = allowedDomains.map((d) => `@${d}`).join(" or ");
  return `Sign in with your ${list} email.`;
}
