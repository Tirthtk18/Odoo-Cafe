# ☕ POS Café — MERN Stack

A complete, full-stack Point of Sale and management system for cafés, built with MongoDB, Express, React, and Node.js. It features a multi-role architecture supporting administrative oversight, cashier operations, kitchen display systems, and customer-facing QR code table ordering.

---

## 📦 Project Structure

```text
pos-cafe/
├── backend/       → Express + MongoDB API (Controllers, Routes, Models, Middleware)
└── frontend/      → React + Vite UI (Pages, Components, Context, API integration)
```

---

## ✨ Features & Modules

### 1. 👑 Admin Dashboard (`/dashboard`)
*   **Overview & KPI Metrics:** Real-time visibility into total orders, revenue, active tables, and top-selling items.
*   **Professional Analytics (Recharts):** 
    *   *Daily Revenue:* Animated gradient `AreaChart` visualizing a 14-day revenue trend.
    *   *Payment Breakdown:* `PieChart` (donut style) showing the distribution of Cash, UPI, and Card transactions.
    *   *Order Status:* `PieChart` visualizing the flow of orders (New, Preparing, Ready, Served).
    *   *Top Selling Items:* Horizontal `BarChart` ranking items by quantity sold and revenue generated.
*   **Table & QR Management:** Generate and download high-resolution, branded PNG QR codes for each table.
*   **Staff Management:** Admin can invite staff members (Cashiers, Kitchen Staff), who receive onboarding emails.

### 2. 🧾 Cashier POS Terminal (`/pos`)
*   **Order Creation:** Add items to cart with quantity tracking, subtotal, and tax calculations.
*   **Multi-mode Payment:** Process payments via Cash (with change calculator), UPI (with mock QR scanning), and Card (with simulated processing).
*   **Kitchen Sync:** Orders are instantly pushed to the Kitchen Display System without needing page reloads (via optimized polling).

### 3. 🍳 Kitchen Display System (`/kitchen`)
*   **Real-time Ticket Queue:** Displays incoming orders categorized by status.
*   **Order Workflow:** Kitchen staff can update the status of items from `New` → `Preparing` → `Ready` → `Served`.

### 4. 📱 Customer Table Ordering (`/table/:tableId` & `/user`)
*   **QR Scanner:** Customers can scan physical table QR codes using their camera or upload a saved QR image (powered by `jsQR`).
*   **Self-Service Menu:** Customers browse the menu, build their cart, and submit orders directly linked to their specific table.
*   **Live Tracking:** Customers can view the real-time status of their orders while they wait.

---

## 📊 Analytics: Understanding the Chart Components
The Admin Dashboard utilizes the **Recharts** library to render fully responsive, dynamic SVG-based analytics. Here is how the chart components work in `Dashboard.jsx`:

1.  **`AreaChart` (Daily Revenue):** Uses `<Area type="monotone" ... />` combined with an `<defs><linearGradient>` to create a smooth, visually appealing curve representing 14-day revenue. A custom `<Tooltip>` intercepts hover events to display exact Rupee amounts securely formatted.
2.  **`PieChart` (Payment & Status Distribution):** Constructed using `<Pie dataKey="value" innerRadius={46} ...>` to achieve the hollow "donut" effect. Data arrays dynamically calculate and map state values to specific `<Cell fill={color}>` elements for consistent branding (e.g., green for cash, purple for UPI).
3.  **`BarChart` (Top Sellers):** Configured with `layout="vertical"` for a horizontal bar layout. The `<XAxis type="number">` is hidden, allowing the `<Bar>` elements to fill the container based on the `qty` dataKey, offering a clear visual ranking of inventory.
4.  **Responsiveness:** All charts are wrapped in a `<ResponsiveContainer width="100%">` ensuring they adapt dynamically to different screen sizes and fluidly resize when the browser window is adjusted.

---

## 🚀 Getting Started

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
MONGO_URI=mongodb://localhost:27017/pos-cafe
JWT_SECRET=your_secret_key_here
PORT=5000
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_16_char_app_password
```
*Note: The app password is required for Nodemailer to send OTP verification codes and digital receipts.*

Start the backend API:
```bash
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Start the React development server:
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

---

## 🔐 Role-Based Access Control (RBAC)
The application enforces strict environmental segregation per role:
*   **Authentication:** Requires OTP verification during initial Admin setup, generating a secure JWT stored as a Bearer token.
*   **Protected Routes:** A generic `<ProtectedRoute roles={['admin', 'cashier', 'kitchen']}>` wrapper component inspects the JWT payload, preventing route access leaks (e.g., stopping a Cashier from viewing the Admin dashboard).

---

## 🛠 Tech Stack Overview
*   **Backend:** Node.js, Express.js, MongoDB (Mongoose)
*   **Frontend:** React 18 (Vite), React Router v6
*   **Styling:** Custom Vanilla CSS & Inline styles
*   **State & Fetching:** React Context API + standard fetch with optimized polling
*   **Utilities:** Recharts (Analytics), Nodemailer (Email services), jsQR (Client-side QR decoding), qrcode.react (QR Generation)
