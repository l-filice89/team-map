# Team Map

A white-label web app for teams to view and share their work locations on an interactive world map—without exposing exact locations. Sign-in can be restricted to allowed email domains.

## Features

- Interactive world map showing team member locations
- Location privacy with coarsened coordinates
- Configurable email domain restriction for authentication
- Optional "Internal tool" label for branding
- Avatar management with Supabase Storage
- Real-time location updates via Supabase Edge Functions

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **UI Components**: shadcn-ui, Radix UI, Tailwind CSS
- **Maps**: Leaflet
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+ and npm
- A Supabase account
- A Vercel account (for deployment)

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd team-map
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy `.env.example` to `.env` and fill in at least the Supabase values:

```bash
cp .env.example .env
```

Edit `.env` and set:

- `VITE_SUPABASE_URL` – Your Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` – Your Supabase anon key
- `VITE_ALLOWED_EMAIL_DOMAINS` – Comma-separated allowed domains (e.g. `company.com`). If empty, sign-in is restricted and no one can log in until you configure domains.

You can find Supabase URL and anon key in your project settings under API.

### 4. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:8080`.

## Configuration

All optional branding and behavior is controlled by environment variables (see `.env.example`).

| Variable                        | Description                                                                                                | Default        |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------- | -------------- |
| `VITE_APP_NAME`                 | App name (header, title, footer)                                                                           | `Team Map`     |
| `VITE_ALLOWED_EMAIL_DOMAINS`    | Comma-separated email domains for sign-in (e.g. `company.com,other.com`). If empty, sign-in is restricted. | (empty)        |
| `VITE_LOGO_URL`                 | Logo image path or URL                                                                                     | `/logo.svg`    |
| `VITE_FAVICON_URL`              | Favicon path or URL                                                                                        | `/favicon.ico` |
| `VITE_SHOW_INTERNAL_TOOL_LABEL` | Set to `true` to show "Internal tool" in Hero, Footer, and SignIn                                          | `false`        |

Replace `public/logo.svg` and `public/favicon.ico` with your own assets, or set `VITE_LOGO_URL` and `VITE_FAVICON_URL` to point to your files.

## Security / Secrets

- **Never commit `.env`.** It is gitignored; use `.env.example` as the template.
- **Never put the Supabase service role key in the frontend or in any `VITE_*` variable.** The frontend uses only the anon (publishable) key. The service role key is used only in Edge Functions via `Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")`, which Supabase injects at runtime.

## Supabase Setup

### 1. Create a New Supabase Project

1. Go to [Supabase](https://app.supabase.com)
2. Create a new project
3. Note your project URL and anon key from Settings > API

### 2. Run Database Migrations

Apply all migrations in the `supabase/migrations/` directory in order:

1. `20251107101642_329bc03b-b67b-4dad-8f21-1764c15a8565.sql` - Creates users table and RLS policies
2. `20251107102839_f7c184ac-46b1-4b95-9fb9-dcfe53f13742.sql` - Creates locations table and RLS policies
3. `20251107103508_115df133-ebd2-4c47-abf1-0424d5b2fd83.sql` - Prevents direct user creation
4. `20251107103712_f6ff5dd5-05b0-4a2b-a5ca-8be56cddf692.sql` - Adds unique constraint on locations
5. `20251107161249_6dfa3ab2-333e-4bb7-8ab0-2bbcb26bf78f.sql` - Creates avatars storage bucket

You can apply these migrations using:

- **Supabase Dashboard**: Go to SQL Editor and run each migration file
- **Supabase CLI**: `supabase db push` (if using local development)

### 3. Deploy Edge Function

Deploy the locations edge function:

```bash
supabase functions deploy locations
```

Or use the Supabase Dashboard:

1. Go to Edge Functions
2. Create a new function named `locations`
3. Copy the contents of `supabase/functions/locations/index.ts`

**Locations API:** Location labels are limited to **100 characters** (enforced by the `locations` Edge Function). The frontend can enforce the same limit for better UX.

**CORS:** For production, configure allowed origins for Edge Functions in Supabase (e.g. Project Settings > API or Edge Functions). Use a restricted origin list instead of allowing all origins.

**Edge function runtime:** The `locations` and `delete-account` functions use Deno std `0.208.0` and `@supabase/supabase-js@2.87.1` (via esm.sh). See the imports in `supabase/functions/*/index.ts` for the exact versions in use.

### 4. Configure Authentication

1. Go to Authentication > Providers in Supabase Dashboard
2. Enable Google OAuth provider (or your chosen provider)
3. Configure OAuth credentials (Client ID and Secret)
4. Add authorized redirect URLs

### 5. Verify Storage Bucket

After running the migrations, verify that the `avatars` storage bucket exists:

1. Go to Storage in Supabase Dashboard
2. Ensure the `avatars` bucket exists and is public

## Deployment to Vercel

### 1. Prepare Your Repository

Ensure all changes are committed and pushed to your Git repository.

### 2. Connect to Vercel

1. Go to [Vercel](https://vercel.com)
2. Click "Add New Project"
3. Import your Git repository
4. Vercel will auto-detect Vite configuration

### 3. Configure Environment Variables

In the Vercel project settings, add at least:

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Your Supabase anon/public key
- `VITE_ALLOWED_EMAIL_DOMAINS` - Your allowed email domains (e.g. `company.com`)

Add any optional branding variables (`VITE_APP_NAME`, `VITE_LOGO_URL`, `VITE_SHOW_INTERNAL_TOOL_LABEL`, etc.) as needed.

### 4. Deploy

Vercel will automatically install dependencies, build, and deploy. The `vercel.json` file handles routing for the React app.

### 5. Update Supabase Redirect URLs

After deployment, update your Supabase authentication settings:

1. Go to Authentication > URL Configuration
2. Add your Vercel deployment URL to "Redirect URLs"
3. Add your Vercel deployment URL to "Site URL"

## Project Structure

```
team-map/
├── src/
│   ├── config/           # App config (branding, domains)
│   ├── auth/             # Authentication context and protected routes
│   ├── components/       # React components
│   │   ├── ui/          # shadcn-ui components
│   │   └── WorldMap.tsx # Main map component
│   ├── integrations/
│   │   └── supabase/    # Supabase client and types
│   ├── lib/             # Utility functions and API clients
│   ├── pages/           # Page components
│   └── App.tsx          # Main app component
├── supabase/
│   ├── functions/       # Edge functions
│   │   └── locations/   # Locations API endpoint
│   ├── migrations/      # Database migrations
│   └── config.toml     # Supabase configuration
├── public/              # Static assets (logo, favicon)
├── test/
│   ├── setup.ts         # Vitest setup (jest-dom)
│   ├── unit/            # Unit tests (mirrors src/)
│   └── e2e/             # Playwright E2E tests
└── vercel.json          # Vercel deployment configuration
```

## Testing

Test output (reports, coverage, and E2E screenshot snapshots) is **not versioned**. Run tests locally to generate any artifacts you need.

### Unit tests (Vitest)

- `npm run test` - Run unit tests in watch mode
- `npm run test:run` - Run unit tests once
- `npm run test:coverage` - Run unit tests with coverage report

Unit tests live under `test/unit/`, mirroring `src/` (e.g. `test/unit/lib/distance.test.ts` for `src/lib/distance.ts`).

### E2E tests (Playwright)

- `npm run test:e2e` - Run E2E tests (starts the dev server automatically)
- `npm run test:e2e:ui` - Run E2E tests with Playwright UI
- `npm run test:e2e:headed` - Run E2E tests in headed browser

E2E tests live in `test/e2e/`. The app runs with your current environment (`.env` or defaults), so **visual snapshots reflect your branding** (e.g. `VITE_APP_NAME`, logo). On first run, screenshot snapshots are created under `test/e2e/__snapshots__/` (gitignored). After intentional UI or config changes, update snapshots with:

```bash
npx playwright test --update-snapshots
```

Authenticated flows (map, list, remove location, delete account) require a test Supabase project or env; add them as needed with `storageState` and a test account.

## Git hooks (Husky)

Husky runs hooks on commit and push. After `npm install`, hooks are installed automatically.

- **Pre-commit:** Runs lint (ESLint) and format (Prettier) on **staged files only** via lint-staged. Fixes are applied to your staged files; re-stage and commit if needed.
- **Pre-push:** (1) Blocks the push if the target branch is `main`; (2) runs unit tests (`npm run test:run`); (3) runs E2E tests (`npm run test:e2e`). Playwright starts the dev server automatically for E2E.
- **Branch rule:** Direct pushes to `main` are disabled by the hook. Use `develop` or feature branches and merge to `main` via PR/workflow.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check formatting with Prettier
- `npm run lint` - Run ESLint
- `npm run test` - Run unit tests (watch)
- `npm run test:run` - Run unit tests once
- `npm run test:coverage` - Run unit tests with coverage
- `npm run test:e2e` - Run E2E tests
- `npm run test:e2e:ui` - Run E2E tests with UI
- `npm run test:e2e:headed` - Run E2E tests (headed)

## Dependency security

Run `npm audit` periodically. Some advisories require major upgrades (e.g. ESLint 10, typescript-eslint 8.x, Vitest 4) and are planned for a follow-up; apply `npm audit fix` for non-breaking fixes.

## License

MIT. See [LICENSE](LICENSE) for details.
