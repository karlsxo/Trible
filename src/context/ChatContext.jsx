import { createContext, useContext, useEffect, useMemo } from 'react'
import { useChatStore } from '../store/chatStore'

const ChatContext = createContext(null)

export const ChatProvider = ({ children }) => {
  const conversations = useChatStore((state) => state.conversations)
  const activeId = useChatStore((state) => state.activeId)
  const ensureConversation = useChatStore((state) => state.ensureConversation)
  const setActiveConversation = useChatStore((state) => state.setActiveConversation)
  const sendMessage = useChatStore((state) => state.sendMessage)
  const initSync = useChatStore((state) => state.initSync)

  useEffect(() => {
    initSync()
  }, [initSync])

  const value = useMemo(
    () => ({
      conversations,
      activeId,
      ensureConversation,
      setActiveConversation,
      sendMessage,
    }),
    [
      conversations,
      activeId,
      ensureConversation,
      setActiveConversation,
      sendMessage,
    ],
  )

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export const useChat = () => {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used within ChatProvider')
  return ctx
}
