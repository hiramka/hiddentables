# Hidden Tables Connect

Lightweight Next.js storefront demo with Supabase integration.

## Overview

Hidden Tables Connect is a small Next.js project that demonstrates a restaurant storefront, cart/checkout flow, and Supabase-backed authentication and data storage. It includes sample pages for menus, restaurants, orders, profiles, and a simple cart context.

## Project Description

Hidden Tables Connect is designed as a minimal, practical starter that demonstrates how to build a connected restaurant storefront using Next.js and Supabase. The repository shows the common building blocks you'll need for a small e-commerce-like experience for restaurants:

- Data model: restaurants, menus, menu items, orders, and users stored in Supabase.
- User flows: browse restaurants and menus, add items to a cart, complete checkout, and track orders.
- Authentication: email/password sign-up and session management via Supabase Auth.
- Persistence: cart state stored in React context and localStorage; orders persisted server-side.

Who this is for:

- Developers learning how to integrate Next.js with Supabase.
- Teams prototyping a restaurant or food-ordering UX.
- Educators demonstrating simple full-stack flows without heavy infra.

Limitations / Not production-ready:

- No production-grade payment integration by default.
- Minimal security and input validation for demonstration purposes.
- Intended as a scaffold — adjust data rules, validation, and auth for production.

## Features

- Next.js App Router (TypeScript)
- Supabase client integration for auth and data
- Cart context with persisted state
- Basic restaurant/menu pages, order tracking, and checkout flow
- Tailwind CSS for styling

## Tech Stack

- Next.js 14+ (App Router)
- React
- TypeScript
- Tailwind CSS
- Supabase

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- A Supabase project (for database and auth)

## Environment

Create a `.env.local` file at the project root with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=anon-public-key
# Optional server-side/service key if needed for certain operations:
SUPABASE_SERVICE_ROLE_KEY=service-role-key
```

Store any other secrets you require per the Supabase setup.

## Setup & Run

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Open http://localhost:3000 to view the app.

Build for production:

```bash
npm run build
npm run start
```

## Project Structure (high level)

- `app/` – Next.js App Router pages and components
- `src/` – React components, context, and Supabase client utility
- `public/` – Static assets
- `supabase/` – Supabase config and SQL schema

Refer to the repository folders for details.

## Development Notes

- The Supabase client is located at `src/lib/supabaseClient.js` and `app/context/AuthContext.tsx` (or similar) contains authentication helpers.
- Cart persistence and UI live in `app/context/CartContext.tsx` and `src/components/CartItem.jsx`.

## Contributing

Contributions and improvements are welcome. Open an issue or submit a PR with a clear description of the change.

## License

This repository does not include a license file. Add one if you plan to make the project public.

---

If you'd like, I can also:

- add a minimal `env.example` file,
- create a `CONTRIBUTING.md`, or
- commit and push these changes for you.
