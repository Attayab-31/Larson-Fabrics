# Larson Fabrics

Premium luxury fabric store — Azam Market, Lahore, Pakistan.

## Structure

| Folder   | Stack                                      |
| -------- | ------------------------------------------ |
| `client` | Next.js (App Router), React, Tailwind v4   |
| `server` | Express, MongoDB, Mongoose                 |

## Quick start

```bash
# Client
cd client
cp .env.example .env.local
npm install
npm run dev

# Server (separate terminal)
cd server
cp .env.example .env
npm install
npm run dev
```

- Client: http://localhost:3000
- API: http://localhost:5000/api/health

## Environment variables

| Location | File            | Purpose |
| -------- | --------------- | ------- |
| Client   | `.env.local`    | `NEXT_PUBLIC_*` only (exposed to browser) |
| Server   | `.env`          | Secrets: DB, JWT, Cloudinary, SMTP |

Generate a JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## Security

- `.env` files are gitignored — see `.env.example` for required keys.
- API uses Helmet, rate limiting, and strict CORS in production.
- Next.js sends security headers (`X-Frame-Options`, `nosniff`, etc.).
- See [SECURITY.md](./SECURITY.md) for reporting vulnerabilities.

## GitHub upload checklist

1. **Confirm no secrets** — run from repo root:
   ```bash
   git status
   ```
   Ensure `.env` / `.env.local` are not listed.

2. **Initialize & push** (first time):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Larson Fabrics web app"
   git branch -M main
   git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
   git push -u origin main
   ```

3. **GitHub repo settings** — enable **Private** if the site is not public; turn on **Dependabot alerts** and **Secret scanning** (public repos / GitHub Advanced Security).

4. **Deployment secrets** — add `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, etc. in Vercel/hosting dashboards, not in the repository.

## Scripts

| Command | Where   | Description        |
| ------- | ------- | ------------------ |
| `npm run dev`   | client / server | Development |
| `npm run build` | client / server | Production build |
| `npm run lint`  | client          | ESLint |

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs lint, build, and `npm audit` on push/PR to `main`.
