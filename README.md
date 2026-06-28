# E-WTR — Welding Test Report Management System

Internal web portal for managing welding documentation workflow in EPCC (Engineering, Procurement, Construction, Commissioning) projects. Handles the full lifecycle of Welding Test Reports — from joint creation, welder assignment, visual inspection, NDT reporting, up to client transmittal and feedback.

Built for multi-role teams: Admin, Supervisor, QC Inspector, Document Controller, and Client.

---

## What it does

- **WTR Lifecycle** — Draft → Visual Inspection → Approval → Transmittal → Client Feedback. Each status transition is role-gated with validation checks (e.g., can't approve without passing inspection).
- **EPC Hierarchy** — Organize project data into System → Line Number → Isometric → Spool → Joint. All levels support CRUD from the UI.
- **Engineering Data** — Manage welders (with stamp numbers/qualifications) and WPS records. Multi-welder pass tracking per WTR (root, fill, cap).
- **NDT Reports** — Standalone NDT entries linked to WTRs that passed visual inspection. Supports RT, UT, MT, PT methods.
- **Defect Tracking** — Auto-generated when an inspection is rejected. Tracks severity, resolution, and corrective actions.
- **Transmittal & Client Portal** — Document Controllers push approved WTRs to clients. Clients can accept/reject with feedback.
- **Dashboard** — Metrics overview with daily/weekly/monthly trend charts (Recharts).
- **Password Reset** — Token-based email flow via Resend.

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| UI | MUI 9 + Tailwind CSS 4 |
| Data Grid | MUI X Data Grid |
| Charts | Recharts |
| Auth | NextAuth.js (JWT strategy, Credentials provider) |
| ORM | Prisma 7 (PostgreSQL adapter) |
| Database | Neon PostgreSQL (serverless) |
| Email | Resend |

## Project Structure

```
src/
├── app/
│   ├── (admin)/           # Authenticated pages
│   │   ├── dashboard/     # Metrics + charts
│   │   ├── wtr/           # WTR management (per project)
│   │   ├── hierarchy/     # EPC tree (System/Line/Iso/Spool)
│   │   ├── engineering/   # Welders & WPS
│   │   ├── inspections/   # Visual inspection log
│   │   ├── ndt/           # NDT report management
│   │   ├── defects/       # Defect tracking
│   │   ├── transmittals/  # Document control
│   │   ├── client-feedback/
│   │   ├── templates/     # Joint templates
│   │   └── users/         # User management (admin only)
│   ├── api/               # REST endpoints (mirrors above)
│   ├── login/
│   ├── forgot-password/
│   └── reset-password/
├── components/layout/     # Header, AdminLayout
├── lib/                   # Prisma client, auth config
└── types/                 # NextAuth type augmentation
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or a [Neon](https://neon.tech) account)
- [Resend](https://resend.com) API key (for password reset emails)

### Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

Fill in your `.env`:

```env
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-hex-32"
RESEND_API_KEY="re_your_key_here"
```

```bash
# Push schema to database
npx prisma db push

# Generate Prisma client
npx prisma generate

# Start dev server
npm run dev
```

App runs on [http://localhost:3000](http://localhost:3000).

### Creating the first admin user

There's no built-in seed script. After setting up the database, create your first user by inserting directly or using Prisma Studio:

```bash
npx prisma studio
```

Create a user in the `User` table with role `admin`. Hash the password with bcrypt (10 rounds).

## Role Permissions

| Action | Admin | Supervisor | QC | Doc Control | Client |
|---|:---:|:---:|:---:|:---:|:---:|
| Create WTR | ✓ | — | ✓ | — | — |
| Approve WTR | ✓ | ✓ | — | — | — |
| Transmit WTR | ✓ | — | — | ✓ | — |
| Submit Inspection | ✓ | — | ✓ | — | — |
| Client Feedback | — | — | — | — | ✓ |
| Manage Users | ✓ | — | — | — | — |
| Manage Hierarchy | ✓ | — | — | — | — |
| Engineering Data | ✓ | — | ✓ | — | — |

## Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmichaelchndra%2Fe-wtr&env=DATABASE_URL,NEXTAUTH_URL,NEXTAUTH_SECRET,RESEND_API_KEY&envDescription=Required%20environment%20variables%20for%20E-WTR&envLink=https%3A%2F%2Fgithub.com%2Fmichaelchndra%2Fe-wtr%23setup&project-name=e-wtr&repository-name=e-wtr)

The button above will clone this repo into your Vercel account and prompt you to fill in the four required environment variables. Make sure `DATABASE_URL` points to a connection-pooling endpoint if using Neon.

Alternatively, deploy manually:

```bash
npm run build
```

## License

Licensed under [CC BY-NC 4.0](./LICENSE). You're free to use, modify, and share this project for non-commercial purposes with attribution. Commercial use and resale are not permitted.
