const ChatLayout = ({ sidebar, header, children, mobileMode = 'list' }) => {
  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-[340px_minmax(0,1fr)]">
      <div
        className={`glass min-h-0 overflow-hidden rounded-3xl p-3 sm:p-4 md:p-5 ${
          mobileMode === 'chat' ? 'hidden lg:block' : 'block'
        }`}
      >
        {sidebar}
      </div>
      <div
        className={`glass min-h-0 flex-col overflow-hidden rounded-3xl p-3 sm:p-4 md:p-6 ${
          mobileMode === 'list' ? 'hidden lg:flex' : 'flex'
        }`}
      >
        {header}
        <div className="mt-4 min-h-0 flex-1 overflow-hidden">{children}</div>
      </div>
    </div>
  )
}

export default ChatLayout
