# HarvestIQ — AI-Powered Smart Agriculture Platform

A complete, production-ready, full-stack AI-powered agriculture web application built with **Next.js 16 (App Router)**, **Firebase Firestore**, **Firebase Authentication**, **Groq AI**, and **OpenWeather API**.

> **Architecture:** Built using Next.js App Router with Firebase as the backend database and Firebase Authentication for secure user management while preserving all core features.

---

## Features

- **Authentication:** Firebase Authentication (Email & Password), secure login/logout, forgot password, role-based access (Farmer/Admin)
- **Farmer Profile:** State, district, village, language, farm size, soil type, irrigation, crops, farming experience, annual income, farming goals
- **AI Farming Assistant:** Multilingual AI chatbot powered by Groq AI (Llama-3.3-70B-Versatile), save/search/delete/share chat history
- **Crop Disease Detection:** Upload crop images with symptoms to receive AI-based disease diagnosis, severity analysis, causes, and treatment suggestions
- **Smart Crop Recommendation:** AI-powered crop recommendations based on soil type, weather conditions, irrigation, and location
- **Weather Module:** OpenWeather API integration providing current weather, 7-day forecast, humidity, rainfall probability, UV index, and AI farming advice
- **Soil, Irrigation, Fertilizer & Pest Management:** AI-powered guidance for improving crop health and productivity
- **Government Schemes:** Agricultural schemes with eligibility, benefits, required documents, and application process
- **Market Prices:** Crop market price listings with analytics and charts
- **Knowledge Center:** Agriculture articles categorized by farming topics
- **Finance Tracker:** Income & expense management, monthly reports, AI financial insights, and PDF export
- **Yield & Profit Prediction:** AI-based crop yield estimation with profitability analysis
- **Notifications:** Global and farmer-specific notifications
- **Global Search:** Search across crops, diseases, schemes, articles, and AI conversations
- **Admin Dashboard:** User management, AI usage monitoring, feedback review, and content management
- **Multilingual Support:** English, Tamil, Telugu, Malayalam, Kannada, and Hindi
- **Modern UI:** Responsive layout, dark/light mode, glassmorphism, animations, loading skeletons, and mobile-friendly navigation

---

## Tech Stack

| Layer | Technology |
|--------|------------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Icons | Lucide React |
| Animation | Framer Motion |
| Backend | Next.js API Routes |
| Database | Firebase Firestore |
| Authentication | Firebase Authentication |
| Storage | Firebase Storage |
| AI | Groq AI (Llama-3.3-70B-Versatile) |
| Weather API | OpenWeather API |
| Deployment | Render (Frontend & Backend) |

---

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

GROQ_API_KEY=your_groq_api_key
OPENWEATHER_API_KEY=your_openweather_api_key

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Configure Firebase

- Create a Firebase project.
- Enable **Authentication** → Email & Password.
- Enable **Cloud Firestore**.
- Enable **Firebase Storage**.
- Copy the Firebase configuration into your `.env.local` file.

### 4. Run the Application

```bash
npm run dev
```

For production:

```bash
npm run build
npm start
```

### 5. Create an Admin User

Register a user normally using Firebase Authentication.

Then update the user's role inside the **users** collection in Firestore:

```json
{
  "role": "admin"
}
```

---

## Deployment

### Frontend (Render)

Build Command

```bash
npm install && npm run build
```

Start Command

```bash
npm start
```

### Backend (Render)

Deploy the backend API on Render with the following environment variables:

- Firebase Configuration
- Groq API Key
- OpenWeather API Key

---

## Project Structure

```text
src/
├── app/
│   ├── (auth)/
│   ├── api/
│   │   ├── ai/
│   │   ├── auth/
│   │   ├── data/
│   │   ├── finance/
│   │   ├── weather/
│   │   ├── profile/
│   │   └── admin/
│   ├── dashboard/
│   └── admin/
├── components/
├── firebase/
│   ├── config.ts
│   ├── auth.ts
│   ├── firestore.ts
│   └── storage.ts
├── lib/
└── utils/
```

---

## Security

- Firebase Authentication
- Firestore Security Rules
- Firebase Storage Security Rules
- Role-Based Authorization (Farmer/Admin)
- Input Validation using Zod
- Protected API Routes
- Environment Variables for API Keys

---

## Firebase Collections

- users
- profiles
- chatHistory
- diseases
- finance
- marketPrices
- knowledgeArticles
- governmentSchemes
- notifications
- feedback

---

## Default Data

- 9 Agriculture Knowledge Articles
- 6 Government Schemes
- 16 Market Price Entries
- Default Notifications
- Sample Crop Categories
- Soil Information
- Pest Management Data

---

## Deployment

- **Frontend:** Render
- **Backend:** Render
- **Database:** Firebase Firestore
- **Authentication:** Firebase Authentication
- **Storage:** Firebase Storage
- **AI:** Groq AI
- **Weather:** OpenWeather API

---

## License

This project is developed for educational and hackathon purposes.
