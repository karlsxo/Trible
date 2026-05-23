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
- **Realtime sync** — Users, drivers, bookings, and chats sync across devices with Firebase Realtime Database
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
- **Firebase Realtime Database** — Shared source of truth for multi-device synchronization

## 📁 Project Structure

```
src/
├── components/       # UI components (auth, dashboard, chat, layout)
├── context/           # State management (Auth, Booking, Chat)
├── pages/             # Route pages (Welcome, Auth, Dashboards, Chat)
├── routes/            # Protected route guards
├── utils/             # LocalStorage helpers and constants
├── lib/               # Firebase client setup
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

## 🔥 Firebase Setup

1. Create a Firebase project and enable Realtime Database.
2. Copy [`.env.example`](.env.example) to `.env`.
3. Fill in the Firebase values from your project settings.
4. Start the app again so Vite loads the env vars.

Required variables:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_DATABASE_URL`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## 📚 Realtime Database Structure

The app reads and writes these top-level nodes:

- `users`
- `drivers`
- `bookings`
- `conversations`
- `students`
- `onlineStatus`

For this MVP, the included [database.rules.json](database.rules.json) keeps those nodes writable so the mock-auth flow works across devices. Sign up with your own student and driver details after configuring Firebase.

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