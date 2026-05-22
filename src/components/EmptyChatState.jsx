const EmptyChatState = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center text-slate-400">
      <p className="text-sm font-semibold text-white">No conversation yet</p>
      <p className="mt-2 text-xs text-slate-400">
        Start chatting with a driver or student to see messages here.
      </p>
    </div>
  )
}

export default EmptyChatState
