import { create } from 'zustand'
import { storage } from '../services/storage'
import { STORAGE_KEYS } from '../utils/constants'
import { safeFirebaseKey } from '../utils/firebaseKey'
import { db } from '../lib/firebase'
import { onValue, push, ref, set as dbSet, update as dbUpdate } from 'firebase/database'

const getActiveId = () => storage.get(STORAGE_KEYS.activeChat, null)
const conversationsRef = () => ref(db, 'conversations')
const messagesRef = () => ref(db, 'messages')

let chatSyncReady = false
let remoteConversationMeta = []
let remoteMessagesByConversation = {}
const normalizeId = (value) => String(value || '').trim().toLowerCase()

const getTimestamp = () =>
  new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })

const makeConversationId = (studentId, driverId) =>
  `${normalizeId(studentId)}__${normalizeId(driverId)}`
const makeConversationKey = (conversationId) => safeFirebaseKey(conversationId)

const conversationsObjectToArray = (conversations) =>
  Object.entries(conversations || {})
    .map(([id, conversation]) => ({
      ...conversation,
      id: conversation.id || id,
      messages: Object.entries(conversation.messages || {})
        .map(([messageId, message]) => ({
          ...message,
          id: message.id || messageId,
        }))
        .sort((a, b) => Number(a.createdAt || 0) - Number(b.createdAt || 0)),
    }))
    .sort((a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0))

const messagesObjectToMap = (messages) =>
  Object.entries(messages || {}).reduce((acc, [conversationKey, conversationMessages]) => {
    acc[conversationKey] = Object.entries(conversationMessages || {})
      .map(([messageId, message]) => ({
        ...message,
        id: message.id || messageId,
      }))
      .sort((a, b) => Number(a.createdAt || 0) - Number(b.createdAt || 0))
    return acc
  }, {})

const mergeConversationMessages = () =>
  remoteConversationMeta
    .map((conversation) => {
      const key = makeConversationKey(conversation.id)
      const topLevelMessages = remoteMessagesByConversation[key]
      return {
        ...conversation,
        messages: topLevelMessages || conversation.messages || [],
      }
    })
    .sort((a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0))

export const useChatStore = create((set, get) => ({
  conversations: [],
  messagesByConversation: {},
  activeId: getActiveId(),

  initSync: () => {
    if (chatSyncReady || typeof window === 'undefined' || !db) return
    chatSyncReady = true

    onValue(conversationsRef(), (snapshot) => {
      remoteConversationMeta = conversationsObjectToArray(snapshot.val())
      set({
        conversations: mergeConversationMessages(),
        messagesByConversation: remoteMessagesByConversation,
        activeId: getActiveId(),
      })
    })

    onValue(messagesRef(), (snapshot) => {
      remoteMessagesByConversation = messagesObjectToMap(snapshot.val())
      set({
        conversations: mergeConversationMessages(),
        messagesByConversation: remoteMessagesByConversation,
        activeId: getActiveId(),
      })
    })
  },

  ensureConversation: (payload) => {
    const studentId = normalizeId(payload.studentId)
    const driverId = normalizeId(payload.driverId)
    if (!studentId || !driverId) return null

    const id = makeConversationId(studentId, driverId)
    const existing = get().conversations.find((c) => c.id === id)

    if (existing) {
      storage.set(STORAGE_KEYS.activeChat, id)
      set({ activeId: id })
      return id
    }

    const nextConversation = {
      id,
      studentId,
      studentName: payload.studentName,
      driverId,
      driverName: payload.driverName,
      terminal: payload.terminal,
      route: payload.route,
      updatedAt: Date.now(),
      unreadBy: {
        [payload.studentId]: 0,
        [payload.driverId]: 0,
      },
      messages: [],
    }

    const next = [nextConversation, ...get().conversations]
    storage.set(STORAGE_KEYS.activeChat, id)
    set({ conversations: next, activeId: id })

    if (db) {
      dbSet(ref(db, `conversations/${makeConversationKey(id)}`), {
        ...nextConversation,
        messages: null,
      })
    }

    return id
  },

  setActiveConversation: (id, userId) => {
    const normalizedId = String(id || '').trim()
    if (!normalizedId) return

    const next = get().conversations.map((conv) => {
      if (conv.id !== normalizedId || !userId) return conv
      return {
        ...conv,
        unreadBy: {
          ...(conv.unreadBy || {}),
          [userId]: 0,
        },
      }
    })

    storage.set(STORAGE_KEYS.activeChat, normalizedId)
    set({ conversations: next, activeId: normalizedId })

    if (db) {
      const activeConversation = next.find((conversation) => conversation.id === normalizedId)
      if (activeConversation) {
        dbUpdate(ref(db, `conversations/${makeConversationKey(normalizedId)}`), {
          unreadBy: activeConversation.unreadBy || {},
          updatedAt: Date.now(),
        })
      }
    }
  },

  sendMessage: ({ conversationId, senderId, receiverId, senderRole, text }) => {
    const trimmed = text.trim()
    if (!trimmed) return

    const normalizedConversationId = String(conversationId || '').trim()
    const normalizedSenderId = normalizeId(senderId)
    const normalizedReceiverId = normalizeId(receiverId)
    if (!normalizedConversationId || !normalizedSenderId || !normalizedReceiverId) return

    const now = Date.now()
    const nextMessage = {
      id: now,
      senderId: normalizedSenderId,
      receiverId: normalizedReceiverId,
      senderRole,
      text: trimmed,
      timestamp: getTimestamp(),
      createdAt: now,
    }

    let hasConversation = false

    const next = get().conversations.map((conv) => {
      if (conv.id !== normalizedConversationId) return conv
      hasConversation = true
      return {
        ...conv,
        unreadBy: {
          ...(conv.unreadBy || {}),
          [normalizedReceiverId]: (conv.unreadBy?.[normalizedReceiverId] || 0) + 1,
        },
        messages: [...conv.messages, nextMessage],
        updatedAt: now,
      }
    })

    if (!hasConversation) return

    set({ conversations: next })

    if (db) {
      const conversation = next.find((conv) => conv.id === normalizedConversationId)
      const message = conversation?.messages?.[conversation.messages.length - 1]
      if (conversation && message) {
        const key = makeConversationKey(normalizedConversationId)
        const messageRef = push(
          ref(db, `messages/${key}`),
        )
        const messageId = messageRef.key
        const nextMessage = { ...message, id: messageId }
        dbSet(messageRef, nextMessage)
        dbSet(ref(db, `conversations/${key}/messages/${messageId}`), nextMessage)
        dbUpdate(ref(db, `conversations/${key}`), {
          unreadBy: conversation.unreadBy || {},
          updatedAt: conversation.updatedAt || Date.now(),
        })
      }
    } else {
      return
    }
  },
}))
