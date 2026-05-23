const MessageBubble = ({ message, isMe }) => {
  return (
    <div className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[86%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-soft sm:max-w-[72%] lg:max-w-[64%] ${
          isMe
            ? 'rounded-br-md bg-emerald-400/20 text-emerald-50'
            : 'rounded-bl-md bg-white/10 text-slate-100'
        }`}
      >
        <p className="break-words">{message.text}</p>
        <p
          className={`mt-2 text-[10px] uppercase ${
            isMe ? 'text-emerald-100/60' : 'text-slate-400'
          }`}
        >
          {message.timestamp}
        </p>
      </div>
    </div>
  )
}

export default MessageBubble
