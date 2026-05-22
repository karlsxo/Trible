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
      if (message?.type === 'CHAT_UPDATED') {
        set({ conversations: getConversations(), activeId: getActiveId() })
      }
    })
  },

  ensureConversation: (payload) => {
    const id = payload.id || `${payload.studentId}__${payload.driverId}`
    const existing = get().conversations.find((c) => c.id === id)

    if (existing) {
      storage.set(STORAGE_KEYS.activeChat, id)
      set({ activeId: id })
      emitSync('CHAT_UPDATED')
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
      messages: [],
    }

    const next = [nextConversation, ...get().conversations]
    storage.set(STORAGE_KEYS.chat, next)
    storage.set(STORAGE_KEYS.activeChat, id)
    set({ conversations: next, activeId: id })
    emitSync('CHAT_UPDATED')
    return id
  },

  setActiveConversation: (id) => {
    storage.set(STORAGE_KEYS.activeChat, id)
    set({ activeId: id })
    emitSync('CHAT_UPDATED')
  },

  sendMessage: (conversationId, sender, text) => {
    const trimmed = text.trim()
    if (!trimmed) return

    const next = get().conversations.map((conv) => {
      if (conv.id !== conversationId) return conv
      return {
        ...conv,
        messages: [
          ...conv.messages,
          {
            id: Date.now(),
            sender,
            text: trimmed,
            timestamp: getTimestamp(),
          },
        ],
      }
    })

    storage.set(STORAGE_KEYS.chat, next)
    set({ conversations: next })
    emitSync('CHAT_UPDATED')
  },
}))
