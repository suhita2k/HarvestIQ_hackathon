# HarvestIQ — AI-Powered Smart Agriculture Platform

A complete, production-ready, full-stack AI-powered agriculture web application built with **Next.js 16 (App Router)**, **PostgreSQL + Drizzle ORM**, **Groq AI**, and **OpenWeather API**.

> **Stack adaptation note:** The original spec called for Vite + Express + MongoDB. This implementation adapts the architecture to the available Next.js + PostgreSQL environment while preserving every feature: session-based auth (HTTP-only cookies, no JWT), bcrypt hashing, multilingual AI, file uploads, REST APIs, and a full admin panel.

## Features

- **Authentication**: Register, login, logout, forgot/reset password, HTTP-only cookie sessions backed by a `sessions` table (no JWT), bcrypt password hashing, role-based access (farmer/admin)
- **Farmer Profile**: State, district, village, language, farm size, soil type, irrigation, crops, experience, income, goals
- **AI Farming Assistant**: Multilingual chat with Groq AI (llama-3.3-70b-versatile), save/search/delete/copy/share chats
- **Crop Disease Advisory**: Image upload + symptom description → AI diagnosis with causes, severity, organic & chemical treatments
- **Smart Crop Recommendation**: Rule-based + AI guidance with expected yield, profit, water requirement, fertilizer schedule
- **Weather Module**: OpenWeather integration — current conditions, 7-day forecast, UV index, rain probability, AI farming advice
- **Soil / Irrigation / Fertilizer / Pest Management**: Tabbed AI guidance for each domain
- **Government Schemes**: 6 seeded schemes with eligibility, benefits, documents, application process
- **Market Prices**: 16 crop-market price points with bar chart analytics
- **Knowledge Center**: 9 articles across 9 categories
- **Finance Tracker**: Expense/income CRUD, monthly trends, category pie charts, AI financial insights, PDF export
- **Yield & Profit Prediction**: Recharts visualizations, risk assessment, AI insights
- **Notifications**: Global + user-specific, filterable by type
- **Global Search**: Searches crops, diseases, articles, schemes, saved chats
- **Admin Panel**: User management, AI usage monitoring, feedback review, content management
- **Multilingual**: English, Tamil, Telugu, Malayalam, Kannada, Hindi — UI + AI responses
- **UI/UX**: Dark/light mode, glassmorphism, responsive sidebar, mobile navigation, loading skeletons, toast notifications, 404 page

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Animation | Framer Motion (available), CSS transitions |
| Icons | Lucide React |
| Backend | Next.js API Routes (Route Handlers) |
| Database | PostgreSQL + Drizzle ORM |
| Auth | HTTP-only signed cookies, bcrypt, server-side sessions |
| AI | Groq API (llama-3.3-70b-versatile) |
| Weather | OpenWeather API |
| File Uploads | FormData (Next.js native), stored in `public/uploads/` |

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
Create a `.env` file:
```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
GROQ_API_KEY=your_groq_api_key
OPENWEATHER_API_KEY=your_openweather_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
SESSION_SECRET=your_secret_min_32_characters
NODE_ENV=development
```

- Get a Groq API key: https://console.groq.com/keys
- Get an OpenWeather API key: https://openweathermap.org/api

### 3. Apply database schema
```bash
npx drizzle-kit push
```

### 4. Run the app
```bash
npm run dev
# or
npm run build && npm start
```

### 5. Create an admin user
Register as a farmer, then promote to admin:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login, register, forgot/reset password
│   ├── api/              # REST API routes
│   │   ├── ai/[type]/    # Chat, disease, crop-rec, soil, irrigation, fertilizer, pest, prediction, finance
│   │   ├── auth/[action]/# Register, login, logout, me, forgot/reset password
│   │   ├── data/[type]/  # Schemes, articles, market, notifications, search
│   │   ├── admin/        # User mgmt, AI usage, feedback
│   │   ├── finance/      # Expense/income CRUD
│   │   ├── weather/      # OpenWeather proxy
│   │   ├── profile/      # Farmer profile GET/PUT
│   │   └── health/       # Health check + DB seeding
│   ├── dashboard/        # All farmer-facing pages
│   └── admin/            # Admin panel
├── components/           # UI components, Sidebar, Topbar, Providers
├── db/                   # Drizzle schema + client
└── lib/                  # Auth, Groq, weather, i18n, constants, rate-limit, seed
```

## Security

- HTTP-only signed cookies (HMAC-SHA256) for session management
- bcrypt password hashing (12 rounds)
- Rate limiting on AI and weather endpoints
- Input validation with Zod on all API routes
- Protected routes via middleware
- No JWT anywhere in the project
- Environment variables for all secrets

## Default Data (Auto-seeded)

- 9 knowledge articles
- 6 government schemes
- 16 market price entries
- 3 global notifications
