import { Send } from 'lucide-react'
import { useState } from 'react'
import Button from './Button'

const ChatInput = ({ onSend }) => {
  const [text, setText] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!text.trim()) return
    onSend(text.trim())
    setText('')
  }

  return (
    <form
      className="mt-3 flex shrink-0 gap-2 border-t border-white/5 bg-night-950/50 pt-3 backdrop-blur md:mt-4 md:pt-4"
      onSubmit={handleSubmit}
    >
      <input
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Type your message"
        className="min-h-11 min-w-0 flex-1 rounded-full border border-slate-700/70 bg-night-800/80 px-4 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-emerald-400/60"
      />
      <Button size="sm" type="submit" className="shrink-0 px-4">
        <Send size={16} />
        <span className="hidden sm:inline">Send</span>
      </Button>
    </form>
  )
}

export default ChatInput
