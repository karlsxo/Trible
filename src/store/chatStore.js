import { create } from 'zustand'
import { storage } from '../services/storage'
import { STORAGE_KEYS } from '../utils/constants'
import { safeFirebaseKey } from '../utils/firebaseKey'
import { db } from '../lib/firebase'
import { onValue, push, ref, set as dbSet, update as dbUpdate } from 'firebase/database'

const getConversations = () => storage.get(STORAGE_KEYS.chat, [])
const getActiveId = () => storage.get(STORAGE_KEYS.activeChat, null)
const conversationsRef = () => ref(db, 'conversations')
const messagesRef = () => ref(db, 'messages')

let chatSyncReady = false
let chatSeeded = false
let remoteConversationMeta = []
let remoteMessagesByConversation = {}

const getTimestamp = () =>
  new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })

const makeConversationId = (studentId, driverId) => `${studentId}__${driverId}`
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

const conversationsArrayToObject = (conversations) =>
  (Array.isArray(conversations) ? conversations : []).reduce((acc, conversation) => {
    if (!conversation?.id) return acc
    acc[makeConversationKey(conversation.id)] = {
      ...conversation,
      messages: (conversation.messages || []).reduce((messageAcc, message) => {
        if (!message?.id) return messageAcc
        messageAcc[String(message.id)] = message
        return messageAcc
      }, {}),
    }
    return acc
  }, {})

export const useChatStore = create((set, get) => ({
  conversations: db ? [] : getConversations(),
  messagesByConversation: {},
  activeId: getActiveId(),

  initSync: () => {
    if (chatSyncReady || typeof window === 'undefined' || !db) return
    chatSyncReady = true

    onValue(conversationsRef(), (snapshot) => {
      const remoteConversations = snapshot.val()

      if (!remoteConversations && !chatSeeded) {
        const legacyConversations = getConversations()
        if (Array.isArray(legacyConversations) && legacyConversations.length > 0) {
          chatSeeded = true
          dbSet(conversationsRef(), conversationsArrayToObject(legacyConversations))
          dbSet(
            messagesRef(),
            legacyConversations.reduce((acc, conversation) => {
              if (!conversation?.id) return acc
              acc[makeConversationKey(conversation.id)] = (conversation.messages || []).reduce(
                (messageAcc, message) => {
                  if (!message?.id) return messageAcc
                  messageAcc[String(message.id)] = message
                  return messageAcc
                },
                {},
              )
              return acc
            }, {}),
          )
          return
        }
      }

      remoteConversationMeta = conversationsObjectToArray(remoteConversations)
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
    const id = makeConversationId(payload.studentId, payload.driverId)
    const existing = get().conversations.find((c) => c.id === id)

    if (existing) {
      storage.set(STORAGE_KEYS.activeChat, id)
      set({ activeId: id })
      return id
    }

    const nextConversation = {
      id,
      studentId: payload.studentId,
      studentName: payload.studentName,
      driverId: payload.driverId,
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
    } else {
      storage.set(STORAGE_KEYS.chat, next)
    }

    return id
  },

  setActiveConversation: (id, userId) => {
    const next = get().conversations.map((conv) => {
      if (conv.id !== id || !userId) return conv
      return {
        ...conv,
        unreadBy: {
          ...(conv.unreadBy || {}),
          [userId]: 0,
        },
      }
    })

    if (!db) {
      storage.set(STORAGE_KEYS.chat, next)
    }
    storage.set(STORAGE_KEYS.activeChat, id)
    set({ conversations: next, activeId: id })

    if (db) {
      const activeConversation = next.find((conversation) => conversation.id === id)
      if (activeConversation) {
        dbUpdate(ref(db, `conversations/${makeConversationKey(id)}`), {
          unreadBy: activeConversation.unreadBy || {},
          updatedAt: Date.now(),
        })
      }
    }
  },

  sendMessage: ({ conversationId, senderId, receiverId, senderRole, text }) => {
    const trimmed = text.trim()
    if (!trimmed) return

    const next = get().conversations.map((conv) => {
      if (conv.id !== conversationId) return conv
      return {
        ...conv,
        unreadBy: {
          ...(conv.unreadBy || {}),
          [receiverId]: (conv.unreadBy?.[receiverId] || 0) + 1,
        },
        messages: [
          ...conv.messages,
          {
            id: Date.now(),
            senderId,
            receiverId,
            senderRole,
            text: trimmed,
            timestamp: getTimestamp(),
            createdAt: Date.now(),
          },
        ],
        updatedAt: Date.now(),
      }
    })

    set({ conversations: next })

    if (db) {
      const conversation = next.find((conv) => conv.id === conversationId)
      const message = conversation?.messages?.[conversation.messages.length - 1]
      if (conversation && message) {
        const messageRef = push(
          ref(db, `messages/${makeConversationKey(conversationId)}`),
        )
        dbSet(messageRef, message)
        dbUpdate(ref(db, `conversations/${makeConversationKey(conversationId)}`), {
          unreadBy: conversation.unreadBy || {},
          updatedAt: conversation.updatedAt || Date.now(),
        })
      }
    } else {
      storage.set(STORAGE_KEYS.chat, next)
    }
  },
}))
