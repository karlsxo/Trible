# TRIBLE - Tricycle Available

A realtime transportation booking MVP that connects students with tricycle drivers for faster campus terminal booking.

Built with React, Vite, Tailwind CSS, Framer Motion, Zustand, Firebase Authentication, and Firebase Realtime Database.

## Features

- Firebase email/password authentication for students and drivers
- Cross-device login with Firebase Auth session persistence
- Realtime driver discovery and online/offline status
- Realtime seat booking and cancellation
- Isolated student-driver conversations
- Realtime chat synchronization across phones, laptops, browsers, and networks
- Premium dark emerald UI, responsive layouts, and existing animation system

## Tech Stack

- React 19
- Vite
- Tailwind CSS 3
- Framer Motion
- React Router DOM
- Zustand
- Firebase Authentication
- Firebase Realtime Database

## Getting Started

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Firebase Setup

1. Create a Firebase project.
2. Enable Authentication with the Email/Password provider.
3. Enable Realtime Database.
4. Copy `.env.example` to `.env`.
5. Fill in the Firebase values from your project settings.
6. Restart the app so Vite loads the env vars.

Required local and Vercel environment variables:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_DATABASE_URL`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## Realtime Database Nodes

The app reads and writes these top-level nodes:

- `users`
- `drivers`
- `bookings`
- `conversations`
- `messages`
- `onlineStatus`

For this presentation MVP, `database.rules.json` keeps the demo nodes readable and writable so multi-device synchronization works during live testing.

## Auth Migration

The migration script creates Firebase Auth users from legacy Realtime Database users and rewrites profiles under `users/<uid>`.

Admin-only environment variables:

- `FIREBASE_DATABASE_URL`
- `GOOGLE_APPLICATION_CREDENTIALS` or `SERVICE_ACCOUNT_JSON`
- `DEFAULT_MIGRATION_PASSWORD`
- `LEGACY_EMAIL_DOMAIN`

Never commit service account JSON, Firebase secrets, or credentials.

Run:

```bash
npm run migrate:auth
```

## Verification Checklist

1. Sign up as a driver on one device with email, username, and password.
2. Log in as that driver on another browser or phone with the same email and password.
3. Set terminal, route, seats, and online status; confirm the student dashboard updates without refresh.
4. Sign up or log in as a student on another device.
5. Book a driver seat; confirm the driver dashboard receives the booking and the seat count changes on both devices.
6. Open chat from the student and driver accounts; send messages both ways and confirm they appear instantly without refresh.
7. Refresh both browsers; confirm sessions restore and previous chats/bookings remain visible.

## Routes

| Route | Description |
| --- | --- |
| `/welcome` | Role selection |
| `/auth/student` | Student signup/login |
| `/auth/driver` | Driver signup/login |
| `/dashboard/student` | Student dashboard |
| `/dashboard/driver` | Driver console |
| `/chat` | Realtime messaging |

## License

MIT
