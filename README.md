🏨 Hotel Room Reservation System

A full-stack web application built as part of the SDE-3 Assessment, implementing an optimized hotel room booking system with smart rules for travel time and room allocation.

✨ Features

97 Rooms across 10 floors

Floors 1–9 → 10 rooms each

Floor 10 → 7 rooms

Smart Booking Rules

Up to 5 rooms per guest

Allocation priority:

Same floor (minimize horizontal distance)

Multi-floor allocation (minimize combined travel time)

Travel Time Calculation

Horizontal: 1 minute per adjacent room

Vertical: 2 minutes per floor

Visualization of rooms (Available / Booked / Last Selected)

Controls

Book rooms

Randomize occupancy

Reset system

🛠 Tech Stack

Frontend: React + Vite + CSS (deployed on Netlify)

Backend: Node.js + Express (deployed on Render)

State: In-memory (extendable to DB like MongoDB/Postgres)

API: REST (CORS enabled)

📂 Project Structure
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

⚡ Installation & Setup (Local Development)
1️⃣ Clone the Repo
git clone https://github.com/Kamini8707/hotel-reservation-app.git
cd hotel-reservation-app

2️⃣ Run Backend
cd backend
npm install
npm run dev
# Backend runs on http://localhost:4000

3️⃣ Run Frontend
cd ../frontend
npm install
# Create .env file in /frontend with backend URL
echo VITE_API_URL=http://localhost:4000 > .env
npm run dev
# Open http://localhost:5173

🌐 Live Demo & Links

Live Demo (Frontend): https://hotel-reservation-ap.netlify.app/

API Backend: https://hotel-reservation-app-g067.onrender.com/

Source Code: https://github.com/Kamini8707/hotel-reservation-app

📖 Project Description

Hotel Room Reservation System 🏨
A full-stack web application for optimized hotel room booking with 97 rooms across 10 floors. It applies smart allocation rules to minimize guest travel time and supports booking up to 5 rooms per guest.

Frontend: React + Vite (deployed on Netlify)

Backend: Node.js + Express (deployed on Render)

Features: Smart room allocation, travel time calculation, booking visualization, reset & randomize occupancy.

📸 Screenshots (Optional)

Add screenshots of your app UI here (Netlify site homepage + booking demo).
Example:

🚀 Future Improvements

Add database support (MongoDB / PostgreSQL)

User authentication (sign-in & booking history)

Admin dashboard for managing rooms

🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to fork this repo and submit a PR.

📜 License

This project is licensed under the MIT License.
