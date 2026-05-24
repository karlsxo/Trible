import { getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

const env = import.meta.env
const getEnv = (key, fallbackKey) => env[key] || env[fallbackKey]
const envDebugCheck = {
  apiKeyExists: Boolean(env.VITE_FIREBASE_API_KEY),
  authDomainExists: Boolean(env.VITE_FIREBASE_AUTH_DOMAIN),
  databaseURLExists: Boolean(env.VITE_FIREBASE_DATABASE_URL),
  projectIdExists: Boolean(env.VITE_FIREBASE_PROJECT_ID),
  appIdExists: Boolean(env.VITE_FIREBASE_APP_ID),
  legacyTypoFallbackUsed: {
    apiKey: !env.VITE_FIREBASE_API_KEY && Boolean(env.VITTE_FIREBASE_API_KEY),
    authDomain:
      !env.VITE_FIREBASE_AUTH_DOMAIN && Boolean(env.VITTE_FIREBASE_AUTH_DOMAIN),
    databaseURL:
      !env.VITE_FIREBASE_DATABASE_URL && Boolean(env.VITTE_FIREBASE_DATABASE_URL),
    projectId:
      !env.VITE_FIREBASE_PROJECT_ID && Boolean(env.VITTE_FIREBASE_PROJECT_ID),
    appId: !env.VITE_FIREBASE_APP_ID && Boolean(env.VITTE_FIREBASE_APP_ID),
  },
}

if (typeof window !== 'undefined') {
  console.log('TRIBLE Firebase ENV Check', envDebugCheck)
}

const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY', 'VITTE_FIREBASE_API_KEY'),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN', 'VITTE_FIREBASE_AUTH_DOMAIN'),
  databaseURL: getEnv('VITE_FIREBASE_DATABASE_URL', 'VITTE_FIREBASE_DATABASE_URL'),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID', 'VITTE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnv(
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITTE_FIREBASE_STORAGE_BUCKET',
  ),
  messagingSenderId: getEnv(
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITTE_FIREBASE_MESSAGING_SENDER_ID',
  ),
  appId: getEnv('VITE_FIREBASE_APP_ID', 'VITTE_FIREBASE_APP_ID'),
}

if (typeof window !== 'undefined') {
  console.log('TRIBLE Firebase config snapshot', {
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    databaseURL: firebaseConfig.databaseURL,
    storageBucket: firebaseConfig.storageBucket,
    messagingSenderId: firebaseConfig.messagingSenderId,
    apiKeyPresent: Boolean(firebaseConfig.apiKey),
    appIdPresent: Boolean(firebaseConfig.appId),
  })
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
const databaseUrlLooksValid =
  !firebaseConfig.databaseURL ||
  (firebaseConfig.databaseURL.startsWith('https://') &&
    firebaseConfig.databaseURL.includes('firebasedatabase'))
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

if (hasConfig && !databaseUrlLooksValid && typeof window !== 'undefined') {
  console.warn(
    'TRIBLE Firebase databaseURL should be a Realtime Database URL such as https://PROJECT_ID-default-rtdb.firebaseio.com or a regional firebasedatabase.app URL.',
  )
}

export const firebaseConfigStatus = {
  ready: hasConfig,
  missingRequiredEnvKeys,
  databaseUrlLooksValid,
  envDebugCheck,
}
export const firebaseReady = Boolean(app)
export const auth = app ? getAuth(app) : null
export const db = app ? getDatabase(app) : null
