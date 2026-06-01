# Security Policy

## Supported versions

| Version | Supported |
| ------- | --------- |
| `main`  | Yes       |

## Reporting a vulnerability

**Do not** open a public GitHub issue for security problems.

1. Email the maintainer privately with a description and steps to reproduce.
2. Allow reasonable time to fix before any public disclosure.

## Secrets & environment

- Never commit `.env`, `.env.local`, or files containing API keys, JWT secrets, or database URIs.
- Use `.env.example` as templates only — placeholders, no real credentials.
- In production, set strong `JWT_SECRET` (48+ random bytes) and restrict `CLIENT_URL` to your real site origin(s).

## Dependency updates

- Run `npm audit --registry=https://registry.npmjs.org` in `client/` and `server/`.
- Dependabot is configured to open weekly update PRs.

## Deployment checklist

- [ ] `NODE_ENV=production` on the API
- [ ] `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL` set in host secrets (not in repo)
- [ ] HTTPS enabled (Vercel / reverse proxy)
- [ ] MongoDB Atlas IP allowlist + least-privilege DB user
- [ ] Cloudinary / SMTP keys only in server environment variables
