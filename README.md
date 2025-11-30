🚁 SkyFleet Pro – Drone Fleet Management Dashboard

A real-time fleet tracking dashboard built with React and Go. It helps monitor drones, missions, alerts and performance analytics from a single interface.

🔥 Key Highlights

Live drone tracking with WebSocket updates

Real-time battery, altitude, temperature and speed monitoring

Mission control system (start, pause, resume, cancel)

Smart alert notifications

Analytics dashboard with fleet insights

Fully responsive UI

🧰 Tech Stack
Area	Technologies
Frontend	React, Vite, WebSocket, CSS
Backend	Go (Fiber), WebSocket, REST API
Database	In-memory demo dataset
Deployment (future ready)	Vercel / Render / CI-CD supported
🖼️ Screens
Section	Preview
Dashboard	Live drone tracking with stats
Mission Control	Manage and monitor active missions
Analytics	Battery, uptime and performance overview
Alerts	Critical, warning and info notifications
🎯 What this project demonstrates

This project shows experience in:

Designing a scalable backend in Go

Building real-time UI using WebSockets and React

Structuring a clean REST API

State management and component organization

Responsive frontend design

Error handling and stability

Full-stack development end-to-end

This is valuable for roles like Full Stack Developer, Frontend Developer, Backend Developer (Go) or React Developer.
⚙️ Run Locally
1. Start Backend
cd backend
go mod tidy
go run .


API will run on:

http://localhost:8080

2. Start Frontend

Open a second terminal:

cd frontend
npm install
npm run dev


UI will start on:

http://localhost:3000

3. Environment configuration

Frontend expects:

VITE_API_URL=http://localhost:8080


WebSocket:

ws://localhost:8080/ws/1

📁 Folder Structure
drone-fleet-dashboard
 ├─ backend
 └─ frontend

🧩 Features in Progress / Optional Enhancements

Cloud deployment (Render + Vercel)

JWT authentication and user roles

Database migration (PostgreSQL)

AI assistance and maintenance prediction

👨‍💻 Author

Sahazad Alam
📌 Full Stack Developer 
