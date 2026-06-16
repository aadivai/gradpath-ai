# GradPath AI — API Specification Directory

GradPath AI uses Next.js Route Handlers (API endpoints) to handle backend calculations, Supabase DB operations, and Google Gemini AI prompting. All requests must provide valid cookie credentials authenticated via Supabase.

---

## Endpoint Summary

| Route | Method | Authentication | Description |
| :--- | :--- | :--- | :--- |
| `/api/recommend` | GET | Authenticated User | Predicts university matches with Gemini explanation. |
| `/api/profile/save` | POST | Authenticated User | Saves/updates student profile academic parameters. |
| `/api/onboarding` | POST | Authenticated User | Registers the user's initial onboarding profile. |
| `/api/chat` | POST | Authenticated User | Interacts with the context-aware study abroad chatbot. |
| `/api/generate-sop` | POST | Authenticated User | Drafts a country/course specific Statement of Purpose. |
| `/api/generate-lor` | POST | Authenticated User | Drafts customized reference letters. |
| `/api/visa-interview`| POST | Authenticated User | Evaluates and grades mock credibility answers. |
| `/api/admin/users` | GET | Admin Role Only | Lists registered user profiles. |
| `/api/admin/logs` | GET | Admin Role Only | Retrieves admin audit logs. |

---

## 1. Recommendations Engine

### `GET /api/recommend`
Query, score, and explain matching universities.

*   **Authentication**: Required (Valid session cookie)
*   **Request Query Parameters**:
    *   `recalculate` (boolean, optional) - Set to `true` to invalidate cache and recalculate.
*   **Response Payload (`200 OK`)**:
    ```json
    {
      "safe": [
        {
          "id": "7c1dc90b-bec2-417a-80b1-775f86c27e11",
          "name": "Technical University of Munich",
          "country": "Germany",
          "city": "Munich",
          "qs_ranking": 37,
          "matching_score": 92,
          "admission_probability": 92,
          "tier": "safe",
          "ai_explanation": "Your CGPA (9.1) exceeds Munich's requirements, and your budget aligns with German tuition-free models.",
          "strengths": ["Excellent GPA", "Strong language skills"],
          "considerations": ["Requires blocked account proof"]
        }
      ],
      "moderate": [],
      "ambitious": [],
      "dream": [],
      "aiInsight": "Your academic profile is extremely competitive. Prioritize German universities first for tuition savings, followed by top-tier US options.",
      "profile": {
        "id": "8c0dc90c-bec1-427a-80b2-775f86c27e24",
        "cgpa": 9.1,
        "branch": "Computer Science",
        "budget_inr": 2500000
      }
    }
    ```
*   **Errors**:
    *   `401 Unauthorized` - Missing or expired session.
    *   `404 Not Found` - Profile not created yet.

---

## 2. Profile Setup & Management

### `POST /api/profile/save`
Update student academic history parameters.

*   **Authentication**: Required (Valid session cookie)
*   **Request Body**:
    ```json
    {
      "full_name": "Aditya Kumar",
      "cgpa": 8.7,
      "branch": "Information Technology",
      "backlogs": 0,
      "work_experience_months": 12,
      "budget_inr": 3500000,
      "ielts_score": 7.5,
      "gre_score": 320,
      "preferred_countries": ["USA", "Germany"],
      "target_intake": "Fall 2026",
      "research_experience_months": 6,
      "projects_count": 3,
      "publications_count": 1,
      "internships_count": 2,
      "weather_preference": "moderate"
    }
    ```
*   **Response Payload (`200 OK`)**:
    ```json
    {
      "success": true,
      "message": "Profile updated successfully."
    }
    ```
*   **Errors**:
    *   `400 Bad Request` - Invalid fields (e.g. CGPA > 10.0 or IELTS > 9.0).

---

## 3. SOP & LOR Writers

### `POST /api/generate-sop`
Generates a first draft Statement of Purpose.

*   **Authentication**: Required (Valid session cookie)
*   **Request Body**:
    ```json
    {
      "universityName": "Technical University of Munich",
      "programName": "M.Sc. Informatics",
      "additionalContext": "Highlight my final year blockchain project."
    }
    ```
*   **Response Payload (`200 OK`)**:
    ```json
    {
      "sop": "Statement of Purpose Draft...\n\nWhy M.Sc. Informatics at TUM...\n\nMy blockchain research...",
      "suggestions": [
        "Include more details about your deep learning elective.",
        "Clarify the timeline of your 12-month work experience."
      ]
    }
    ```

---

## 4. Visa Interview preparation

### `POST /api/visa-interview`
Grades student answers to simulated embassy questions.

*   **Authentication**: Required (Valid session cookie)
*   **Request Body**:
    ```json
    {
      "country": "Germany",
      "question": "Why did you choose Germany instead of studying in India?",
      "answer": "German education is cheap and highly recognized globally in computing."
    }
    ```
*   **Response Payload (`200 OK`)**:
    ```json
    {
      "score": 7,
      "verdict": "Approved with recommendations",
      "critique": "Your answer is honest, but you must elaborate more on the specific curriculum blocks at TUM and how they fit your career path.",
      "improvedAnswer": "Germany offers state-of-the-art research labs for M.Sc. Informatics. TUM's curriculum focuses on high-performance computing, which aligns directly with my career goal of building scalable infrastructures."
    }
    ```
