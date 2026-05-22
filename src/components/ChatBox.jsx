import { Send } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import Button from './Button'

const ChatBox = ({ messages = [], onSend, title, currentRole = 'student' }) => {
  const [text, setText] = useState('')
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!text.trim()) return
    onSend?.(text.trim())
    setText('')
  }

  return (
    <div className="glass flex h-full flex-col rounded-3xl p-4 md:p-6">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/70">
          Conversation
        </p>
        <p className="text-lg font-semibold text-white">{title}</p>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto pr-2">
        {messages.map((item) => {
          const isMe = item.sender === currentRole
          return (
          <div
            key={item.id}
            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
                isMe
                  ? 'bg-emerald-400/20 text-emerald-100'
                  : 'bg-white/10 text-slate-100'
              }`}
            >
              <p>{item.message}</p>
              <p className="mt-2 text-[10px] uppercase text-slate-400">
                {item.time}
              </p>
            </div>
          </div>
          )
        })}
        <div ref={endRef} />
      </div>
      <div className="mt-4 flex gap-2">
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Type your message"
          className="flex-1 rounded-full border border-slate-700/70 bg-night-800/80 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500"
        />
        <Button size="sm" onClick={handleSend}>
          <Send size={16} />
          Send
        </Button>
      </div>
    </div>
  )
}

export default ChatBox
