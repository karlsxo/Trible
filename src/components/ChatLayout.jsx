const ChatLayout = ({ sidebar, header, children }) => {
  return (
    <div className="grid h-[70vh] grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
      <div className="glass rounded-3xl p-4 md:p-5">{sidebar}</div>
      <div className="glass flex h-full flex-col rounded-3xl p-4 md:p-6">
        {header}
        <div className="mt-4 flex-1 overflow-y-auto pr-2">{children}</div>
      </div>
    </div>
  )
}

export default ChatLayout
