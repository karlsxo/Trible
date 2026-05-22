const MessageBubble = ({ message, isMe }) => {
  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
          isMe
            ? 'bg-emerald-400/20 text-emerald-50'
            : 'bg-white/10 text-slate-100'
        }`}
      >
        <p>{message.text}</p>
        <p className="mt-2 text-[10px] uppercase text-slate-400">
          {message.timestamp}
        </p>
      </div>
    </div>
  )
}

export default MessageBubble
