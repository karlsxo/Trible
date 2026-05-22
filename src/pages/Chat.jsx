import { useEffect } from 'react'
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

const Chat = () => {
  const { session } = useAuth()
  const navigate = useNavigate()
  const { conversations, activeId, setActiveConversation, sendMessage } = useChat()

  useEffect(() => {
    if (!session) navigate('/welcome')
  }, [session, navigate])

  const active = conversations.find((c) => c.id === activeId) || null

  const handleSend = (text) => {
    if (!active) return
    sendMessage(active.id, session.role, text)
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
              items={conversations.map((c) => ({
                id: c.id,
                title: session?.role === 'driver' ? c.studentName : c.driverName,
                subtitle: c.messages?.[c.messages.length - 1]?.text || c.route,
              }))}
              activeId={activeId}
              onSelect={(id) => setActiveConversation(id)}
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
                  isMe={
                    (session.role === 'student' && m.sender === 'student') ||
                    (session.role === 'driver' && m.sender === 'driver')
                  }
                />
              ))}
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
