This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```
# AFIX

Template

## Run the app (Windows PowerShell)

If `node` or `npm` is not found on your machine, install Node.js (LTS) first. Recommended options:

- Download and run the installer from https://nodejs.org/ (choose LTS).
- Or use winget (Windows 10/11 with App Installer):

```powershell
winget install --id OpenJS.NodeJS.LTS -e
```

After installing Node, restart your terminal (close/reopen PowerShell).

From the repository root (`c:\Users\cleo_\Documents\GitHub\1-versao-afix`) run:

```powershell
# optional: make the helper script executable in this session
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# install dependencies (one-time)
npm install

# start the dev server (Next.js)
npm run dev
```

If you'd prefer a quick helper that checks for Node and runs the right commands, use the included script `scripts\start-dev.ps1`:

```powershell
# Run once to install and start
.\scripts\start-dev.ps1 -InstallDeps

# Or run without installing if you already have node_modules
.\scripts\start-dev.ps1
```

If you hit errors, paste the terminal output here and I'll help debug.

## Supabase setup

This project includes the Supabase JS client. To connect the app to your Supabase project, create a `.env.local` in the repository root with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-public-key>
# For server-only operations, keep this secret and never expose it to the browser
SUPABASE_SERVICE_ROLE=<your-service-role-key>
```

Where to get these values:
- Open your Supabase project → Settings → API. You'll find the Project URL and the anon/public key there. The Service Role key is provided under "Service role" (keep it secret).

After adding `.env.local`, restart the dev server and your app will be able to import the Supabase client from `src/lib/supabase.ts`.

### Custom authentication (using your `profiles` table)

This project includes an optional custom authentication flow that validates credentials against a `password_hash` column on the `profiles` table (server-side). The code provides two API endpoints you can use:

- `POST /api/auth/admin/create-user` — (server-side) create a new profile with a bcrypt password hash. Requires `SUPABASE_SERVICE_ROLE` in `.env.local`.
- `POST /api/auth/login` — validate email/password against the `profiles` table. On success this endpoint returns `{ ok: true, user }` and sets an `afix_session` httpOnly cookie signed with `JWT_SECRET`.

How to use:
1. Ensure `.env.local` includes `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE` and `JWT_SECRET`.
2. Create the `password_hash` column (the bundled `supabase/schema.sql` already declares it for `profiles`).
3. Create a user (either via Dashboard or using the admin API):

```powershell
# Example: create a user by calling the admin endpoint locally (replace values)
curl -X POST http://localhost:3000/api/auth/admin/create-user -H "Content-Type: application/json" -d '{"email":"deniz.r.v@gmail.com","password":"SenhaForte123!","full_name":"Deniz"}'
```

4. Start the dev server and login via the UI (header dialog or /login). The server endpoint will verify the bcrypt hash and issue a signed JWT cookie.

Notes:
- The admin create-user endpoint uses bcrypt to hash passwords and inserts into `profiles.password_hash`. If you already manage users elsewhere, ensure your table and column names match (the code looks in `profiles` and `users`).
- Never expose `SUPABASE_SERVICE_ROLE` or `JWT_SECRET` in client-side code or commit them to git. Use `.env.local`.

### Criar a base de dados (SQL)

Você pode criar as tabelas do projeto copiando/colando o conteúdo de `supabase/schema.sql` no editor SQL do Supabase (Dashboard → SQL Editor → New query) e executando. Em seguida rode `supabase/seed.sql` para popular os serviços iniciais.

Alternativamente use o Supabase CLI (instale via `npm i -g supabase`):

```powershell
# log in via browser once
supabase login

# link to your project (local only)
supabase link --project-ref <your-project-ref>

# apply schema
supabase db push --file supabase/schema.sql

# run seed
supabase db sql --file supabase/seed.sql
```

Notas:
- Se usar chaves de serviço (service role) apenas em código server-side, não adicione o service role à `NEXT_PUBLIC_...`.
- Considere configurar RLS (Row Level Security) nas tabelas `requests`, `quotes` e `messages` para proteger dados por utilizador.
You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:


You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
