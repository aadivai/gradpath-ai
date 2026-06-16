# GradPath AI — Technical Architecture

GradPath AI is built as a highly responsive, modern "Study Abroad OS" using the Next.js 15 App Router framework. It bridges client-side interactive state with a server-side PostgreSQL database and an on-demand Generative AI layers.

---

## Technical Stack

*   **Frontend Framework**: Next.js 15 (App Router, Turbopack) & React 19
*   **Styling Engine**: Tailwind CSS (Vanilla CSS variables with smooth light/dark glassmorphism theme adapters)
*   **Database**: PostgreSQL hosted on Supabase (with direct SQL, Row-Level Security, Views, and Custom Database Functions/RPCs)
*   **Authentication**: Supabase Auth (integrated server-side via cookies and client-side via React Context providers)
*   **AI Models**: Google Gemini 2.5 Flash API (server-only endpoint calls with strict schema validation)
*   **Deployment**: Vercel Cloud Platform (edge caching, global hosting, dynamic serverless functions)

---

## System Component Relationships

```mermaid
flowchart TD
    subgraph Browser Client
        UI[React components] <-->|useAuth Context & Hooks| ClientClient[Supabase Client]
    end

    subgraph Vercel Runtime (Server)
        Middleware[Next.js Middleware] -->|Auth/RBAC Checks| Routes[App Router Pages & APIs]
        Routes <-->|getSupabaseServer Client| ServerClient[Supabase Server Client]
        Routes <-->|Gemini Node API Client| Gemini[Gemini 2.5 API]
    end

    subgraph Database Layer (Supabase)
        ServerClient <-->|REST Query / RPC Call| DB[(PostgreSQL Database)]
        ClientClient <-->|Direct RLS Access| DB
    end
```

---

## Layout and Core Data Flow

1.  **Request Initiation**:
    The user requests a page or triggers an action (e.g., matching universities).
2.  **Authentication Guarding**:
    Next.js Middleware intercepts the request, reads session cookies, and ensures the user is logged in. Unauthenticated requests are redirected to `/login`.
3.  **API Execution**:
    API Route Handlers (e.g., `/api/recommend`) are invoked:
    *   The backend retrieves the user's validated session.
    *   It queries the profile details from the `profiles` table.
4.  **Database RPC Scoring**:
    The backend calls the PostgreSQL function `recommend_universities` via Supabase RPC. Scoring, constraints, and gpa threshold filters are evaluated at the database level.
5.  **Gemini Explanation Generation**:
    The top 5 matched universities are compiled and passed to Gemini 2.5 Flash alongside the student's profile criteria. Gemini returns a structured JSON object containing personalized explanations, strengths, and considerations.
6.  **Response Delivery**:
    The server compiles the structured database records and AI insights into a single JSON response, returning it to the client in under 600ms.
