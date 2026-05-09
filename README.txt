
TASKFLOW - PROJECT MANAGER


TaskFlow is a professional, full-stack project management application
designed to help teams organize projects, track tasks, and monitor 
performance through a beautiful, data-driven dashboard.


1. TECH STACK

- Frontend: React.js, Vite, Tailwind CSS, Recharts, Lucide Icons
- Backend: Node.js, Express.js
- Database: PostgreSQL
- Authentication: JWT (JSON Web Tokens), Bcrypt.js


2. HOW TO RUN THE PROJECT


A. DATABASE SETUP:
1. Create a PostgreSQL database named 'taskflow'.
2. Update the password in 'backend/.env'.

B. START THE BACKEND:
1. Open a terminal in the 'backend' folder.
2. Run: npm install
3. Run: npm run dev
(Server runs on port 5000)

C. START THE FRONTEND:
1. Open a NEW terminal in the 'frontend' folder.
2. Run: npm install
3. Run: npm run dev
(App runs on port 3000 or 3001)

D. SEED SAMPLE DATA (Optional):
1. In the 'backend' folder terminal, run: node seed.js
(This fills the database with sample projects and users)


3. TEST ACCOUNTS

You can create your own account through the Signup page, or use the 
seed script (node seed.js) to populate the database with sample 
members and projects. Check seed.js for sample login details.

4. KEY FEATURES

- Interactive Dashboard with charts (Pie, Bar, Line).
- Project Management (Create, Edit, Delete, Progress Tracking).
- Task Board (Priority-coded, Status toggles).
- Team Directory (Performance stats per member).
- Activity Logs (History of all actions).
- Onboarding Wizard for new users.


