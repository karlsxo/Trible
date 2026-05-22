import { useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'
import ChatLayout from '../components/ChatLayout'
import ChatSidebar from '../components/ChatSidebar'
import ConversationList from '../components/ConversationList'
import ChatHeader from '../components/ChatHeader'
import MessageBubble from '../components/MessageBubble'
import ChatInput from '../components/ChatInput'
import EmptyChatState from '../components/EmptyChatState'
import { useNavigate } from 'react-router-dom'
import { useBooking } from '../context/BookingContext'

const Chat = () => {
  const { session } = useAuth()
  const navigate = useNavigate()
  const { conversations, activeId, setActiveConversation, sendMessage } = useChat()
  const { tricycles } = useBooking()
  const messagesEndRef = useRef(null)
  const driverStatusMap = Object.fromEntries(
    tricycles.map((driver) => [driver.driverUsername, driver.status]),
  )
  const scopedConversations = conversations.filter((c) =>
    session?.role === 'driver'
      ? c.driverId === session.username
      : c.studentId === session?.username,
  )

  useEffect(() => {
    if (!session) navigate('/welcome')
  }, [session, navigate])

  const active = scopedConversations.find((c) => c.id === activeId) || null

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [active?.messages?.length, activeId])

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
    <div className="px-4">
      <ChatLayout
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
                    : 'Student',
              }))}
              activeId={activeId}
              onSelect={(id) => setActiveConversation(id, session.username)}
            />
          </ChatSidebar>
        }
        header={
          active ? (
            <ChatHeader title={session.role === 'driver' ? active.studentName : active.driverName} subtitle={active.route} />
          ) : (
            <ChatHeader title="No active chat" subtitle="Select a conversation" />
          )
        }
      >
        {active ? (
          <div className="flex h-full flex-col">
            <div className="flex-1 space-y-3 overflow-y-auto">
              {active.messages.map((m) => (
                <MessageBubble
                  key={m.id}
                  message={{ text: m.text, timestamp: m.timestamp }}
                  isMe={m.senderId === session.username}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
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
