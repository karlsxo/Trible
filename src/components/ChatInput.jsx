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
    <form className="mt-4 flex gap-2" onSubmit={handleSubmit}>
      <input
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Type your message"
        className="flex-1 rounded-full border border-slate-700/70 bg-night-800/80 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500"
      />
      <Button size="sm" type="submit">
        <Send size={16} />
        Send
      </Button>
    </form>
  )
}

export default ChatInput
