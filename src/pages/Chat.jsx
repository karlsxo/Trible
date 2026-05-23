import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'
import ChatLayout from '../components/ChatLayout'
import ChatSidebar from '../components/ChatSidebar'
import ConversationList from '../components/ConversationList'
import ChatHeader from '../components/ChatHeader'
import MessageBubble from '../components/MessageBubble'
import ChatInput from '../components/ChatInput'
import EmptyChatState from '../components/EmptyChatState'
import BackButton from '../components/BackButton'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useBooking } from '../context/BookingContext'

const Chat = () => {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { conversations, setActiveConversation, sendMessage } = useChat()
  const { tricycles } = useBooking()
  const messagesEndRef = useRef(null)
  const [selectedConversationId, setSelectedConversationId] = useState(null)
  const [mobileChatOpen, setMobileChatOpen] = useState(false)
  const driverStatusMap = Object.fromEntries(
    tricycles.map((driver) => [driver.driverUsername, driver.status]),
  )
  const scopedConversations = conversations.filter((c) =>
    session?.role === 'driver'
      ? c.driverId === session.username
      : c.studentId === session?.username,
  )
  const requestedConversationId = searchParams.get('conversation')
  const effectiveConversationId = requestedConversationId || selectedConversationId

  useEffect(() => {
    if (!session) navigate('/welcome')
  }, [session, navigate])

  const active =
    scopedConversations.find((c) => c.id === effectiveConversationId) || null

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [active?.messages?.length, effectiveConversationId])

  const handleSend = (text) => {
    if (!active) return
    const receiverId =
      session.role === 'driver' ? active.studentId : active.driverId

    sendMessage({
      conversationId: active.id,
      senderId: session.username,
      receiverId,
      senderRole: session.role,
      text,
    })
  }

  return (
    <div className="mx-auto w-full max-w-7xl overflow-hidden px-3 py-3 sm:px-4 md:py-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <BackButton
          fallback={
            session?.role === 'driver' ? '/dashboard/driver' : '/dashboard/student'
          }
          className="shrink-0"
        />
      </div>
      <ChatLayout
        mobileMode={
          active && (mobileChatOpen || requestedConversationId) ? 'chat' : 'list'
        }
        sidebar={
          <ChatSidebar
            title={session?.role === 'driver' ? 'Driver chats' : 'Your chats'}
            subtitle={session?.name}
          >
            <ConversationList
              items={scopedConversations.map((c) => ({
                id: c.id,
                title: session?.role === 'driver' ? c.studentName : c.driverName,
                subtitle: c.messages?.[c.messages.length - 1]?.text || c.route,
                timestamp: c.messages?.[c.messages.length - 1]?.timestamp || '',
                unread: c.unreadBy?.[session.username] || 0,
                status:
                  session?.role === 'student'
                    ? driverStatusMap[c.driverId] || 'Offline'
                    : 'Online',
              }))}
              activeId={effectiveConversationId}
              onSelect={(id) => {
                setActiveConversation(id, session.username)
                setSelectedConversationId(id)
                if (requestedConversationId) {
                  setSearchParams({}, { replace: true })
                }
                setMobileChatOpen(true)
              }}
            />
          </ChatSidebar>
        }
        header={
          active ? (
            <ChatHeader
              title={session.role === 'driver' ? active.studentName : active.driverName}
              subtitle={active.route}
              status={
                session.role === 'driver' ||
                driverStatusMap[active.driverId] !== 'Offline'
              }
              onBack={() => {
                if (requestedConversationId) {
                  setSearchParams({}, { replace: true })
                }
                setMobileChatOpen(false)
              }}
            />
          ) : (
            <ChatHeader title="No active chat" subtitle="Select a conversation" />
          )
        }
      >
        {active ? (
          <div className="flex h-full min-h-0 flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pr-1 sm:pr-2"
              >
                {active.messages.map((m) => (
                  <MessageBubble
                    key={m.id}
                    message={{ text: m.text, timestamp: m.timestamp }}
                    isMe={
                      m.senderId
                        ? m.senderId === session.username
                        : (m.senderRole || m.sender) === session.role
                    }
                  />
                ))}
                <div ref={messagesEndRef} />
              </motion.div>
            </AnimatePresence>
            <ChatInput onSend={handleSend} />
          </div>
        ) : (
          <EmptyChatState />
        )}
      </ChatLayout>
    </div>
  )
}

export default Chat
