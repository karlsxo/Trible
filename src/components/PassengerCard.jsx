import { MessageSquareText } from 'lucide-react'
import Button from './Button'
import StatusBadge from './StatusBadge'

const PassengerCard = ({ data, onChat, onAccept }) => {
  return (
    <div className="glass rounded-3xl p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-lg font-semibold text-white">{data.student}</p>
          <p className="break-words text-sm text-slate-300">
            Destination: {data.destination}
          </p>
        </div>
        <StatusBadge status={data.status} />
      </div>
      <div className="mt-3 flex flex-col gap-3 text-sm text-slate-300 sm:flex-row sm:items-center sm:justify-between">
        <span>Seats: {data.seatCount}</span>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
          <Button size="sm" variant="ghost" onClick={() => onChat(data)} className="w-full sm:w-auto">
            <MessageSquareText size={14} />
            Chat
          </Button>
          <Button
            size="sm"
            onClick={() => onAccept(data)}
            disabled={data.status === 'Accepted'}
            className="w-full sm:w-auto"
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PassengerCard
