#!/usr/bin/env node

import admin from 'firebase-admin'
import process from 'node:process'

const {
  FIREBASE_DATABASE_URL,
  GOOGLE_APPLICATION_CREDENTIALS,
  SERVICE_ACCOUNT_JSON,
  DEFAULT_MIGRATION_PASSWORD,
  LEGACY_EMAIL_DOMAIN = 'trible.local',
} = process.env

const getCredential = () => {
  if (SERVICE_ACCOUNT_JSON) {
    return admin.credential.cert(JSON.parse(SERVICE_ACCOUNT_JSON))
  }

  if (GOOGLE_APPLICATION_CREDENTIALS) {
    return admin.credential.applicationDefault()
  }

  return admin.credential.applicationDefault()
}

if (!FIREBASE_DATABASE_URL) {
  console.error('Missing FIREBASE_DATABASE_URL.')
  process.exit(1)
}

admin.initializeApp({
  credential: getCredential(),
  databaseURL: FIREBASE_DATABASE_URL,
})

const normalizeEmail = (value) => String(value || '').trim().toLowerCase()
const normalizeUsername = (value) => String(value || '').trim().toLowerCase()
const makeFallbackEmail = (username) =>
  `${normalizeUsername(username).replace(/[^a-z0-9._-]/g, '_')}@${LEGACY_EMAIL_DOMAIN}`

const usersSnapshot = await admin.database().ref('users').get()
const legacyUsers = usersSnapshot.val() || {}

let migrated = 0
let skipped = 0

for (const [legacyKey, legacyUser] of Object.entries(legacyUsers)) {
  const username = normalizeUsername(legacyUser?.username)
  const email = normalizeEmail(legacyUser?.email) || makeFallbackEmail(username)
  const password = legacyUser?.password || DEFAULT_MIGRATION_PASSWORD

  if (!username || !email || !password) {
    skipped += 1
    console.warn(`Skipped ${username || 'unknown user'}: missing email/password.`)
    continue
  }

  let authUser
  try {
    authUser = await admin.auth().getUserByEmail(email)
  } catch (error) {
    if (error.code !== 'auth/user-not-found') throw error
    authUser = await admin.auth().createUser({
      email,
      password,
      displayName: legacyUser.fullName || username,
    })
  }

  const profile = {
    id: authUser.uid,
    username,
    email,
    fullName: legacyUser.fullName || username,
    role: legacyUser.role,
    driverNumber: legacyUser.driverNumber || '',
    createdAt: legacyUser.createdAt || Date.now(),
  }

  await admin.database().ref(`users/${authUser.uid}`).set(profile)
  if (legacyKey !== authUser.uid) {
    await admin.database().ref(`users/${legacyKey}`).remove()
  }

  if (profile.role === 'driver') {
    await admin.database().ref(`drivers/${username}`).update({
      id: authUser.uid,
      fullName: profile.fullName,
      username,
      driverNumber: profile.driverNumber,
      route: legacyUser.route || '',
      terminal: legacyUser.terminal || '',
      availableSeats: Number(legacyUser.availableSeats) || 3,
      isOnline: Boolean(legacyUser.isOnline ?? legacyUser.online ?? false),
      updatedAt: Date.now(),
    })
  }

  migrated += 1
  console.log(`Migrated ${username} -> ${email}`)
}

console.log(`Done. Migrated ${migrated} user(s), skipped ${skipped}.`)
