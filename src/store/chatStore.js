import { create } from 'zustand'
import { storage } from '../services/storage'
import { STORAGE_KEYS } from '../utils/constants'
import { emitSync, onSync } from '../utils/broadcast'

const getConversations = () => storage.get(STORAGE_KEYS.chat, [])
const getActiveId = () => storage.get(STORAGE_KEYS.activeChat, null)

let chatSyncReady = false

const getTimestamp = () =>
  new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })

const makeConversationId = (studentId, driverId) => `${studentId}__${driverId}`

export const useChatStore = create((set, get) => ({
  conversations: getConversations(),
  activeId: getActiveId(),

  initSync: () => {
    if (chatSyncReady || typeof window === 'undefined') return
    chatSyncReady = true

    window.addEventListener('storage', (event) => {
      if (event.key === STORAGE_KEYS.chat) {
        set({ conversations: getConversations() })
      }
      if (event.key === STORAGE_KEYS.activeChat) {
        set({ activeId: getActiveId() })
      }
    })

    onSync((message) => {
      if (message?.type === 'MESSAGE_SENT') {
        set({ conversations: getConversations(), activeId: getActiveId() })
      }
    })
  },

  ensureConversation: (payload) => {
    const id = makeConversationId(payload.studentId, payload.driverId)
    const existing = get().conversations.find((c) => c.id === id)

    if (existing) {
      storage.set(STORAGE_KEYS.activeChat, id)
      set({ activeId: id })
      emitSync('MESSAGE_SENT')
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
      unreadBy: {
        [payload.studentId]: 0,
        [payload.driverId]: 0,
      },
      messages: [],
    }

    const next = [nextConversation, ...get().conversations]
    storage.set(STORAGE_KEYS.chat, next)
    storage.set(STORAGE_KEYS.activeChat, id)
    set({ conversations: next, activeId: id })
    emitSync('MESSAGE_SENT')
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

    storage.set(STORAGE_KEYS.chat, next)
    storage.set(STORAGE_KEYS.activeChat, id)
    set({ conversations: next, activeId: id })
    emitSync('MESSAGE_SENT')
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
          },
        ],
      }
    })

    storage.set(STORAGE_KEYS.chat, next)
    set({ conversations: next })
    emitSync('MESSAGE_SENT')
  },
}))
