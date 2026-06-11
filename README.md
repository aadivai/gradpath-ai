# 🎓 GradPath AI

> **AI-Powered Study Abroad Planning Platform**
> Helping students discover universities, scholarships, generate Statements of Purpose, and manage their entire application journey in one place.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.0-38BDF8)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E)
![Clerk](https://img.shields.io/badge/Clerk-Authentication-purple)
![Gemini AI](https://img.shields.io/badge/Gemini-AI-orange)
![License](https://img.shields.io/badge/License-MIT-green)

---

# 📖 Overview

GradPath AI is a full-stack AI-powered web application designed to simplify the study abroad process for students.

Instead of using multiple websites for university research, scholarship search, SOP writing, and application tracking, GradPath AI brings everything together into one intelligent platform.

Users can:

* 🎯 Get personalized university recommendations
* 💰 Discover scholarships matching their profile
* ✍️ Generate AI-powered Statements of Purpose
* 📅 Track application timelines
* ❤️ Save and organize universities
* 👤 Maintain an academic profile for smarter recommendations

---

# ✨ Features

## 🔐 Authentication

* Secure Clerk Authentication
* Sign In / Sign Up
* Protected Dashboard Routes
* Session Management

---

## 👤 Student Profile

Store and update:

* Full Name
* Branch
* CGPA
* IELTS / TOEFL / GRE Scores
* Budget
* Preferred Countries
* Work Experience
* Target Intake

---

## 🏛 AI University Recommendation System

Personalized recommendations based on:

* Academic Performance
* Budget
* Test Scores
* Preferred Countries

Universities are classified into:

* ✅ Safe
* ⚡ Moderate
* 🚀 Ambitious

---

## 💰 Scholarship Explorer

Browse scholarships using filters:

* Country
* Scholarship Type
* Degree Eligibility
* Minimum CGPA
* Funding Amount

---

## ✍️ AI SOP Generator

Generate professional Statements of Purpose using Google Gemini AI.

Features:

* Country-specific SOPs
* University-specific customization
* Academic background integration
* Career goals alignment

---

## 📅 Application Timeline

Track important milestones:

* IELTS Preparation
* SOP Draft
* Recommendation Letters
* Applications
* Visa Process
* Accommodation
* Flight Booking

Includes:

* Progress Tracking
* Category-wise Completion
* Timeline Visualization

---

## ❤️ Saved Universities

Users can:

* Save universities
* Track application status
* Add notes
* Estimate yearly costs

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
* Supabase

## Authentication

* Clerk

## AI

* Google Gemini API

## Database

* Supabase PostgreSQL

---

# 📂 Project Structure

```text
src/
│
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   ├── api/
│   └── layout.tsx
│
├── components/
│
├── lib/
│   ├── gemini.ts
│   ├── supabase.ts
│   ├── profile.ts
│   └── recommender.ts
│
├── types/
│
└── public/
```

---

# 🚀 Installation

Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/gradpath-ai.git

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

Open

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

# 🗄 Database

Powered by Supabase PostgreSQL.

Main Tables:

* profiles
* universities
* scholarships
* saved_universities
* timeline_tasks

---

# 🎯 Future Improvements

* Resume Analyzer
* AI Chat Study Abroad Assistant
* Visa Document Generator
* Email Notifications
* Multi-language Support
* University Comparison Tool
* Analytics Dashboard
* Mobile Responsive Enhancements

---

# 📈 Learning Outcomes

This project demonstrates:

* Full Stack Development
* Authentication & Authorization
* Database Design
* AI Integration
* REST API Development
* TypeScript
* Modern React Patterns
* Next.js App Router
* Production Deployment

---

# 🤝 Contributing

Contributions, feature requests, and suggestions are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a Pull Request

---

# 👨‍💻 Author

**Aditya Kumar**

B.Tech Information Technology
Madan Mohan Malaviya University of Technology, Gorakhpur

**Interests**

* Full Stack Development
* Artificial Intelligence
* Cloud Technologies
* Software Engineering

---

# ⭐ Support

If you found this project helpful, consider giving it a ⭐ on GitHub.

It motivates continued development and helps others discover the project.
