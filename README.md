# ☕ POS Café — MERN Stack

Full-stack Point of Sale system for cafés, built with MongoDB, Express, React, and Node.js.

---

## 📦 Project Structure

```
pos-cafe/
├── backend/       → Express + MongoDB API
└── frontend/      → React + Vite UI
```

---

## 🚀 Getting Started

### 1. Backend Setup

```bash
cd backend
npm install
```

Copy the example env file and fill in your values:
```bash
cp .env.example .env
```

Edit `.env`:
```
MONGO_URI=mongodb://localhost:27017/pos-cafe
JWT_SECRET=any_long_random_string_here
PORT=5000
GMAIL_USER=yourgmail@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

> **Gmail App Password:**
> 1. Go to your Google Account → Security
> 2. Enable 2-Step Verification
> 3. Go to App Passwords → Generate one for "Mail"
> 4. Paste the 16-character password into GMAIL_APP_PASSWORD

Start the backend:
```bash
npm run dev     # with nodemon (auto-restart)
npm start       # production
```

Backend runs at: `http://localhost:5000`

---

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 🔐 Authentication Flow

| Step | Who | What happens |
|------|-----|-------------|
| `/signup` | Admin | Fill name, email, password → OTP sent to Gmail |
| `/verify-otp` | Admin | Enter 6-digit OTP → Account verified → JWT token |
| `/login` | All roles | Email + password → JWT → Redirected to role screen |
| Admin creates staff | Admin | From dashboard → Cashier/Kitchen get welcome email |

---

## 👥 Roles & Access

| Role | Landing Page | Created By |
|------|-------------|------------|
| `admin` | `/dashboard` | Self signup + OTP |
| `cashier` | `/pos` | Admin creates |
| `kitchen` | `/kitchen` | Admin creates |

---

## 🌐 API Endpoints

### Auth (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Admin register → sends OTP |
| POST | `/api/auth/verify-otp` | Verify OTP → returns JWT |
| POST | `/api/auth/resend-otp` | Resend OTP |
| POST | `/api/auth/login` | Login all roles |

### Auth (Protected — requires Bearer token)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/create-staff` | Admin: create cashier/kitchen |
| GET | `/api/auth/staff` | Admin: list all staff |
| DELETE | `/api/auth/staff/:id` | Admin: remove staff |

---

## 🗺️ Build Roadmap

- [x] **Step 1** — Authentication (OTP email, JWT, role-based routing)
- [ ] **Step 2** — Admin Dashboard (products, variants, staff management)
- [ ] **Step 3** — POS Session + Floor View (tables, sessions)
- [ ] **Step 4** — Order Creation (cashier + mobile QR self-ordering)
- [ ] **Step 5** — Kitchen Display System
- [ ] **Step 6** — Payment Processing (Cash, Card, UPI QR)
- [ ] **Step 7** — Reports & Analytics

---

## 🛠 Tech Stack

- **Backend:** Node.js, Express, MongoDB, Mongoose, JWT, Bcrypt, Nodemailer
- **Frontend:** React 18, Vite, React Router v6
- **Auth:** JWT tokens, Gmail OTP via Nodemailer
