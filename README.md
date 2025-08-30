# 🏨 Hotel Room Reservation System

A full-stack web application built as part of the **SDE-3 Assessment**, implementing an optimized hotel room booking system with rules for travel time and room allocation.

---

## 🚀 Features

- **97 rooms** across 10 floors  
  - Floors 1–9 → 10 rooms each  
  - Floor 10 → 7 rooms  
- **Smart Booking Rules**  
  - Up to **5 rooms per guest**  
  - Priority:  
    1. Same floor (minimize horizontal distance)  
    2. Multi-floor allocation (minimize combined travel time)  
- **Travel Time Calculation**  
  - Horizontal: `1 minute` per adjacent room  
  - Vertical: `2 minutes` per floor  
- **Visualization** of rooms (Available / Booked / Last Selected)  
- **Controls**  
  - Book rooms  
  - Randomize occupancy  
  - Reset system  

---

## 🛠 Tech Stack

- **Frontend** → React + Vite + CSS (Netlify/Vercel deployable)  
- **Backend** → Node.js + Express (Render/Railway deployable)  
- **State** → In-memory (can extend to DB like MongoDB/Postgres)  
- **API** → REST (CORS enabled)  

---

## 📂 Project Structure

```text
hotel-reservation-app/
│
├── backend/              # Node.js + Express API
│   ├── server.js         # Backend logic
│   └── package.json
│
├── frontend/             # React + Vite app
│   ├── src/              # Components & styles
│   └── package.json
│
└── README.md



---
```



⚡ Installation & Setup
1. Clone Repo
git clone https://github.com/<your-username>/hotel-reservation-app.git
cd hotel-reservation-app

2. Run Backend
cd backend
npm install
npm run dev
# Backend runs on http://localhost:4000

3. Run Frontend
cd ../frontend
npm install
# Create .env file with backend URL
echo VITE_API_URL=http://localhost:4000 > .env
npm run dev
# Open http://localhost:5173
