# Orbitra

![CI](https://github.com/bhavyak29/orbitra/actions/workflows/ci.yml/badge.svg)

A revenue-intelligence SaaS marketing site with a working backend: visitors book a demo, leads are validated and stored in PostgreSQL, and an admin dashboard manages them through pipeline stages.

**Live demo:** https://orbitra-jomr.onrender.com
*(Hosted on a free tier. The first load after a quiet period can take up to a minute while the server wakes up.)*

![Home page](docs/home.png)

## Features

- Multi-page responsive marketing site with a WebGL planet scene
- Demo-request form with server-side validation, spam protection (honeypot + rate limiting) and email notification
- Password-protected admin page to view leads, move them through stages (New → Qualified → Negotiation → Won/Lost) and delete them
- Public stats endpoint that powers the live pipeline dashboard on the home page
- Automated tests and a CI pipeline on every push

## Tech stack

| Area | Tools |
|---|---|
| Server | Node.js, Express, TypeScript |
| Database | PostgreSQL (Neon), Prisma ORM |
| Validation | Zod |
| Auth | JWT with a timing-safe password check |
| Security | Helmet, express-rate-limit |
| Email | Resend |
| Testing | Vitest, Supertest |
| DevOps | GitHub Actions, Docker, Render |
| Frontend | HTML, CSS, vanilla JavaScript, Three.js |

## API

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/api/leads` | Public (rate-limited) | Submit a demo request |
| GET | `/api/leads` | Admin | List all leads |
| PATCH | `/api/leads/:id` | Admin | Change a lead's stage |
| DELETE | `/api/leads/:id` | Admin | Delete a lead |
| POST | `/api/auth/login` | Public (rate-limited) | Get an admin token |
| GET | `/api/stats/public` | Public | Aggregate counts only, no personal data |
| GET | `/api/health` | Public | Health check |

## Run locally

**You need:** Node.js 22+ and a free PostgreSQL database (for example from [Neon](https://neon.tech)).

```bash
git clone https://github.com/bhavyak29/orbitra.git
cd orbitra
npm install
cp .env.example .env        # on Windows: copy .env.example .env
# fill in DATABASE_URL, JWT_SECRET and ADMIN_PASSWORD in .env
npx prisma migrate dev
npm run seed                # optional demo data
npm run dev
```
Open http://localhost:3000 and the admin page at http://localhost:3000/admin.html.

Run the tests with `npm test`.

## Screenshots

| Contact form | Admin dashboard |
|---|---|
| ![Contact](docs/contact.png) | ![Admin](docs/admin.png) |

## Project structure

```
src/        Express app, routes, middleware, validation schemas
prisma/     Database schema, migrations, seed script
public/     Website pages
tests/      API tests
```

## Notes

This is a portfolio project. Company names, logos, statistics and testimonials on the site are placeholders for design purposes only and are not real customers or endorsements.