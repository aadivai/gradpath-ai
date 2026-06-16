# GradPath AI — Deployment & Production Checklists

This document provides structured guidelines and verification lists for launching GradPath AI into a production environment.

---

## 🚀 Cloud Deployment Checklist

- [x] **Repository Linking**: Verify Vercel project matches the active GitHub repository branch.
- [x] **Client-Server Environment variables**:
  - `NEXT_PUBLIC_SUPABASE_URL` is set and matches the active Supabase project endpoint.
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` matches the public anon key.
  - `GEMINI_API_KEY` is loaded in Vercel settings and is not blank.
- [x] **Database Migrations**:
  - Verify all relational schemas are deployed (`profiles`, `universities`, `scholarships`, `saved_universities`, `timeline_tasks`, `visa_requirements`).
  - Verify static seed records for universities (2000+ rows) and scholarships (500+ rows) are fully loaded.
- [x] **Row-Level Security (RLS)**:
  - Confirm RLS toggle is active on all tables.
  - Confirm policies limit student profile access to `auth.uid() = clerk_user_id`.

---

## 🔒 Production Verification Checklist

- [x] **Production Build Validation**:
  - Run `npm run build` locally to ensure there are no compilation errors or chunking size warnings.
- [x] **OAuth Credentials Integrity**:
  - Ensure redirect URLs in Supabase Auth Settings contain `https://gradpath-ai.vercel.app/api/auth/callback` to handle authentication routing.
- [x] **Gemini API Call Limits**:
  - Verify server route queries handle connection timeout fallbacks gracefully and return formatted JSON.
- [x] **Search Indexability**:
  - Confirm `public/robots.txt` and `public/sitemap.xml` are accessible at the domain root.

---

## ⚠️ Known Issues & Mitigations

1.  **Rate-Limiting on Gemini API**:
    *   *Symptom*: Rapid, consecutive API requests might result in standard HTTP `429 Too Many Requests` from Google AI Studio.
    *   *Mitigation*: Handlers inside `route.ts` are equipped with fallback schemas (`explainRecommendations.ts`) to return robust matching descriptions without breaking the dashboard UI.

2.  **Supabase Auth Redirect Loops on Localhost**:
    *   *Symptom*: Toggling login states on localhost can cache redirection tokens.
    *   *Mitigation*: The middleware is configured to handle localhost redirects cleanly. Clear cookies or use an incognito window if session mismatch loops occur.
