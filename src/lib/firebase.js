import { getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const requiredEnvKeys = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_DATABASE_URL',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
]

const envToConfigKey = {
  VITE_FIREBASE_API_KEY: 'apiKey',
  VITE_FIREBASE_AUTH_DOMAIN: 'authDomain',
  VITE_FIREBASE_DATABASE_URL: 'databaseURL',
  VITE_FIREBASE_PROJECT_ID: 'projectId',
  VITE_FIREBASE_APP_ID: 'appId',
}

const missingRequiredEnvKeys = requiredEnvKeys.filter(
  (key) => !firebaseConfig[envToConfigKey[key]],
)
const hasConfig = missingRequiredEnvKeys.length === 0
const app = hasConfig
  ? getApps().length > 0
    ? getApps()[0]
    : initializeApp(firebaseConfig)
  : null

if (!hasConfig && typeof window !== 'undefined') {
  console.warn(
    `TRIBLE Firebase is not configured. Missing: ${missingRequiredEnvKeys.join(', ')}`,
  )
}

export const firebaseConfigStatus = {
  ready: hasConfig,
  missingRequiredEnvKeys,
}
export const firebaseReady = Boolean(app)
export const auth = app ? getAuth(app) : null
export const db = app ? getDatabase(app) : null
