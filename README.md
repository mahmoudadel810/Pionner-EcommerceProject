# Pionner Client

The storefront and admin dashboard for Pionner, an electronics shop with Arabic and English support.

Live demo: https://pionner-v21.vercel.app
Backend (Node.js / Express / MongoDB): https://github.com/mahmoudadel810/Pionner-Server-Prod-V0.1

## Features

- Product catalog with filtering, sorting, featured products and a deals page
- Categories with per-category product listings
- Search with live suggestions
- Cart with quantity updates and per-customer coupon codes
- Wishlist
- Checkout with Stripe Payment Element
- Order history and order cancellation on the profile page
- Sign up with email confirmation, login, forgotten-password and reset flows
- Profile editing with a profile picture upload
- Contact form
- Admin dashboard: products, categories, orders (order and payment status), users, coupons, customer messages and sales analytics
- Arabic and English, with full right-to-left layout for Arabic

## Stack

- React 18 and React Router 7
- Vite 6
- Tailwind CSS 4 and shadcn/ui (Radix UI)
- Zustand for state
- i18next / react-i18next
- Axios
- Stripe (`@stripe/react-stripe-js`)
- Framer Motion

## Getting started

Requirements: Node.js 22 and pnpm.

```bash
pnpm install
cp .env.example .env
pnpm dev
```

The app runs at http://localhost:5173.

### Environment variables

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Base URL of the API, e.g. `http://localhost:8000/api/v2`. Defaults to the hosted API. |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (`pk_test_...`). Defaults to the demo test key. |

To run against a local backend, start the server from the backend repository and set `VITE_API_URL` to its `/api/v2` URL.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the development server |
| `pnpm build` | Build for production into `dist/` |
| `pnpm preview` | Serve the production build locally |
| `pnpm lint` | Run ESLint |
| `pnpm format` | Format the code with Prettier |

## Project structure

```
src/
  components/   shared components; ui/ holds the shadcn/ui primitives
  config/       API base URL and endpoint map
  hooks/        reusable hooks
  i18n/         i18next setup
  lib/          axios instance and helpers
  locales/      en and ar translation files
  pages/        route components
  stores/       Zustand stores (user, cart, wishlist, products, categories, payments)
```

## Deployment

The app is deployed on Vercel. `vercel.json` rewrites all routes to `index.html` so client-side routing works on refresh.

## License

[MIT](LICENSE)
