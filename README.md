# TRIBLE — Tricycle Available

A modern web application that connects students with tricycle drivers for faster, smarter terminal booking on campus.

Built with **React**, **Vite**, **Tailwind CSS**, and **Framer Motion** — featuring premium dark emerald UI, real-time-feeling chat, and full authentication flow.

## ✨ Features

- **Role-based authentication** — Students and drivers sign up and log in with their own accounts
- **Driver discovery** — Registered drivers appear in the student dashboard in real time
- **Seat booking** — Students can book available seats with live availability
- **Real-time chat** — Built-in messaging system where students and drivers can communicate
- **Driver online/offline** — Drivers can toggle visibility and appear/disappear from the student view
- **Booking management** — Drivers can view and accept passenger requests
- **Persistent data** — All users, sessions, chats, and bookings are saved to LocalStorage
- **Route protection** — Authenticated users are redirected to their correct dashboard
- **Responsive design** — Works seamlessly on mobile, tablet, and desktop

## 🚀 Demo Flow

1. **Sign up as a Driver** → go to `/auth/driver`, create an account
2. **Sign up as a Student** → go to `/auth/student`, create an account
3. **See registered drivers** → student dashboard shows only drivers who have signed up
4. **Book a seat & chat** → students can book seats and message drivers
5. **Driver receives messages** → driver logs in and sees conversations

## 🛠️ Tech Stack

- **React 19** — UI framework
- **Vite** — Build tool
- **Tailwind CSS 3** — Utility-first styling
- **Framer Motion** — Animations
- **React Router DOM** — Client-side routing
- **Lucide React** — Icons
- **LocalStorage** — Data persistence

## 📁 Project Structure

```
src/
├── components/       # UI components (auth, dashboard, chat, layout)
├── context/           # State management (Auth, Booking, Chat)
├── pages/             # Route pages (Welcome, Auth, Dashboards, Chat)
├── routes/            # Protected route guards
├── utils/             # LocalStorage helpers and constants
├── data/              # Seed data
├── services/          # Storage abstraction
├── App.jsx            # Root app with routing
└── main.jsx           # Entry point
```

## 🖥️ Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌐 Pages / Routes

| Route | Description |
|-------|-------------|
| `/welcome` | Role selection (Student / Driver) |
| `/auth/student` | Student signup / login |
| `/auth/driver` | Driver signup / login |
| `/dashboard/student` | Student dashboard — browse drivers, book seats, chat |
| `/dashboard/driver` | Driver console — manage seats, view passengers, chat |
| `/chat` | Real-time messaging between students and drivers |

## 📝 License

MIT — built as a prototype for campus mobility experiences.