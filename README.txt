Weekly Report Application
=========================

A full-stack application designed to help teams submit, track, review, and analyze weekly status reports.

TECH STACK
----------
- Frontend: Next.js (React), Tailwind CSS v4, Recharts
- Backend: Node.js, Express, Prisma ORM
- Database: PostgreSQL
- AI Integration: Google Gemini API (for report summaries)

FEATURES
--------
- Role-based Access Control: Admin, Manager, and Team Member roles.
- Weekly Reports: Submit, edit, and track weekly tasks and hours.
- AI-Powered Insights: Generate automatic summaries from team reports.
- Manager Reviews: Review, approve, or request corrections on reports.
- Dashboard: Visualize team performance, workload, and task completion trends.
- Historical Versions: Track report history and revisions.

PREREQUISITES
-------------
Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- PostgreSQL

INSTALLATION & SETUP
--------------------

1. Database Setup
   Create a new PostgreSQL database named "weekly_report_db".

2. Backend Setup
   a. Open a terminal and navigate to the "backend" directory:
      cd backend
   b. Install dependencies:
      npm install
   c. Create a ".env" file in the "backend" directory and configure the following variables:
      DATABASE_URL="postgresql://<USERNAME>:<PASSWORD>@localhost:5432/weekly_report_db?schema=public"
      PORT=5000
      JWT_SECRET=your_jwt_secret_key_here
      GEMINI_API_KEY=your_google_gemini_api_key_here
   d. Push the Prisma schema to the database:
      npx prisma db push
   e. Seed the database with initial roles, test users, and sample reports:
      npx prisma db seed
   f. Start the backend development server:
      npm run dev
      (The backend server will run on http://localhost:5000)

3. Frontend Setup
   a. Open a new terminal window and navigate to the "frontend" directory:
      cd frontend
   b. Install dependencies:
      npm install
   c. Create a ".env.local" file in the "frontend" directory and define the backend API URL:
      NEXT_PUBLIC_API_URL=http://localhost:5000/api
   d. Start the frontend development server:
      npm run dev
      (The frontend application will run on http://localhost:3000)

DEFAULT TEST ACCOUNTS
---------------------
If you ran the database seed (npx prisma db seed), the following test accounts are available.

Default Password for all accounts: password123

Role     | Email
-----------------------------
Admin    | admin@company.com

PROJECT STRUCTURE
-----------------
weekly_report/
|
+-- backend/                  # Express server & APIs
|   +-- prisma/               # Prisma schema & seed scripts
|   +-- src/
|       +-- controllers/      # Route handlers
|       +-- middleware/       # Auth & role validation
|       +-- routes/           # Express route definitions
|       +-- services/         # Business logic & AI integration
|
+-- frontend/                 # Next.js web application
    +-- src/
        +-- app/              # Next.js App Router pages
        +-- components/       # Reusable React components
        +-- lib/              # API clients & utilities
        +-- types/            # TypeScript definitions
