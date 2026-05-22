import ChatBox from './ChatBox'

const ChatModal = ({ title, messages, onSend, currentRole }) => {
  return (
    <div className="glass h-full rounded-3xl p-4 md:p-6">
      <ChatBox
        title={title}
        messages={messages}
        onSend={onSend}
        currentRole={currentRole}
      />
    </div>
  )
}

export default ChatModal
