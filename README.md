# 🚀 TaskFlow - Professional Project Manager

TaskFlow is a comprehensive, full-stack project management application designed to help teams organize projects, track tasks, and monitor performance through a beautiful, data-driven dashboard.

---

## ✨ Features

- **📊 Dynamic Dashboard**: Visualize project health with Pie, Bar, and Line charts using Recharts.
- **📁 Project Management**: Full CRUD operations for projects, including member assignments and progress tracking.
- **✅ Interactive Task Board**: Tasks with priority-coded borders, due-date flags, and quick status toggle buttons.
- **👥 Team Directory**: Detailed directory showing all members, their roles, and task completion metrics.
- **📜 Activity Logs**: A chronological timeline of all major actions taken within the system.
- **🧭 Onboarding Wizard**: A smooth 5-step interactive guide for new users.

---

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, Tailwind CSS, Recharts, Lucide Icons
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens), Bcrypt.js

---

## 🚀 Getting Started

### 1. Database Setup
1. Create a PostgreSQL database named `taskflow`.
2. Navigate to the `backend/` folder.
3. Update the `DATABASE_URL` in `.env` with your PostgreSQL password:
   ```env
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/taskflow
   ```

### 2. Start the Backend (API)
```bash
cd backend
npm install
npm run dev
```
*Server will run on `http://localhost:5000`*

### 3. Start the Frontend (UI)
```bash
cd frontend
npm install
npm run dev
```
*App will run on `http://localhost:3000` (or 3001)*

### 4. Seed Sample Data (Optional)
To quickly populate the app with projects and tasks, run this in the `backend/` folder:
```bash
node seed.js
```

---

## 🔑 Test Accounts
You can create your own account through the Signup page, or use the seed script (`node seed.js`) to populate the database with sample members and projects. Check the `seed.js` file for default login details.

---

## 📸 Preview
*Check the dashboards for real-time analytics and the project view for task management.*

---


