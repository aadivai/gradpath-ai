# 🎓 GradPath AI

> **AI-Powered Study Abroad Planning Platform**
> Discover universities, explore scholarships, generate AI-powered Statements of Purpose, and manage your complete study abroad journey in one place.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4-38BDF8)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E)
![Clerk](https://img.shields.io/badge/Clerk-Authentication-purple)
![Gemini AI](https://img.shields.io/badge/Gemini-AI-orange)
![Vercel](https://img.shields.io/badge/Deployment-Vercel-black)

## 🌐 Live Demo

**Live Application:** https://gradpath-ai.vercel.app

**GitHub Repository:** https://github.com/aadivai/gradpath-ai

---

# 📖 Overview

GradPath AI is a modern full-stack web application designed to simplify the entire study abroad planning process.

Instead of switching between multiple websites for university research, scholarship discovery, SOP writing, and application tracking, students can manage everything from a single AI-powered platform.

---

# ✨ Key Features

### 🎯 AI University Recommendations

Receive personalized university suggestions based on:

* CGPA
* Test Scores (IELTS/GRE/TOEFL)
* Budget
* Preferred Countries
* Academic Background

Recommendations are categorized into:

* ✅ Safe
* ⚡ Moderate
* 🚀 Ambitious

---

### 💰 Scholarship Explorer

Search scholarships using intelligent filters:

* Country
* Scholarship Type
* Degree Level
* Minimum CGPA
* Funding Amount

---

### ✍️ AI SOP Generator

Generate personalized Statements of Purpose using **Google Gemini AI**.

Features include:

* University-specific SOPs
* Country-specific customization
* Academic background integration
* Career goal alignment

---

### 📅 Application Timeline

Track every important milestone:

* IELTS Preparation
* SOP Writing
* Recommendation Letters
* University Applications
* Visa Process
* Accommodation
* Flight Booking

Includes progress tracking and timeline visualization.

---

### ❤️ Saved Universities

Users can:

* Save universities
* Track application status
* Add personal notes
* Estimate yearly expenses

---

### 🔐 Secure Authentication

Powered by Clerk Authentication.

* Sign Up
* Sign In
* Protected Dashboard
* Secure Session Management

---

# 🛠 Tech Stack

## Frontend

* Next.js 16 (App Router)
* React 19
* TypeScript
* Tailwind CSS 4
* shadcn/ui

## Backend

* Next.js API Routes

## Database

* Supabase PostgreSQL

## Authentication

* Clerk

## AI Integration

* Google Gemini API

## Deployment

* Vercel

---

# 📂 Project Structure

```
src/
│
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   ├── api/
│   └── layout.tsx
│
├── components/
├── lib/
├── types/
└── public/
```

---

# 🚀 Installation

Clone the repository

```bash
git clone https://github.com/aadivai/gradpath-ai.git

cd gradpath-ai
```

Install dependencies

```bash
npm install
```

Run locally

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

# 🔑 Environment Variables

Create a `.env.local` file.

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=

CLERK_SECRET_KEY=

NEXT_PUBLIC_SUPABASE_URL=

NEXT_PUBLIC_SUPABASE_ANON_KEY=

GEMINI_API_KEY=
```

---

# 📸 Screenshots

Add screenshots here for a better portfolio presentation.

```
screenshots/
│
├── landing-page.png
├── dashboard.png
├── universities.png
├── scholarships.png
├── sop-generator.png
└── timeline.png
```

---

# 🎯 Learning Outcomes

This project demonstrates:

* Full Stack Development
* Authentication & Authorization
* AI Integration
* REST API Development
* Database Design
* TypeScript
* Modern React
* Next.js App Router
* Production Deployment
* Responsive UI Design

---

# 🚀 Future Enhancements

* Resume Analyzer
* AI Study Abroad Chatbot
* University Comparison Tool
* Email Notifications
* Cost Calculator
* Dark Mode
* Mobile App Support
* Analytics Dashboard

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a new feature branch
3. Commit your changes
4. Open a Pull Request

---

# 👨‍💻 Author

**Aditya Kumar**

B.Tech Information Technology
Madan Mohan Malaviya University of Technology, Gorakhpur

### Interests

* Full Stack Development
* Artificial Intelligence
* Cloud Computing
* Software Engineering

GitHub: https://github.com/aadivai

---

# 📄 License

This project is licensed under the MIT License.

---

# ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub.

Your support helps improve the project and motivates future development.
