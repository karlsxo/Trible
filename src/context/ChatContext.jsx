import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { storage } from '../services/storage'
import { STORAGE_KEYS } from '../utils/constants'

const ChatContext = createContext(null)

const getTimestamp = () =>
  new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })

export const ChatProvider = ({ children }) => {
  const [conversations, setConversations] = useState(() =>
    storage.get(STORAGE_KEYS.chat, []),
  )
  const [activeId, setActiveId] = useState(() =>
    storage.get(STORAGE_KEYS.activeChat, null),
  )

  useEffect(() => {
    storage.set(STORAGE_KEYS.chat, conversations)
  }, [conversations])

  useEffect(() => {
    storage.set(STORAGE_KEYS.activeChat, activeId)
  }, [activeId])

  useEffect(() => {
    const handler = (event) => {
      if (event.key === STORAGE_KEYS.chat && event.newValue) {
        setConversations(JSON.parse(event.newValue))
      }
      if (event.key === STORAGE_KEYS.activeChat) {
        setActiveId(event.newValue ? JSON.parse(event.newValue) : null)
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  const ensureConversation = (payload) => {
    const id = payload.id || `${payload.studentId}__${payload.driverId}`
    const existing = conversations.find((item) => item.id === id)
    if (existing) {
      setActiveId(id)
      return id
    }

    const next = {
      id,
      studentId: payload.studentId,
      studentName: payload.studentName,
      driverId: payload.driverId,
      driverName: payload.driverName,
      terminal: payload.terminal,
      route: payload.route,
      messages: payload.messages || [],
    }

    setConversations((prev) => [next, ...prev])
    setActiveId(id)
    return id
  }

  const setActiveConversation = (id) => setActiveId(id)

  const sendMessage = (conversationId, sender, text) => {
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id !== conversationId) return conv
        const nextMessage = {
          id: Date.now(),
          sender,
          text,
          timestamp: getTimestamp(),
        }
        return {
          ...conv,
          messages: [...conv.messages, nextMessage],
        }
      }),
    )
  }

  const value = useMemo(
    () => ({
      conversations,
      activeId,
      ensureConversation,
      setActiveConversation,
      sendMessage,
    }),
    [conversations, activeId],
  )

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export const useChat = () => useContext(ChatContext)