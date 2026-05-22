import { MessageSquareText } from 'lucide-react'
import Button from './Button'
import StatusBadge from './StatusBadge'

const PassengerCard = ({ data, onChat, onAccept }) => {
  return (
    <div className="glass rounded-3xl p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-semibold text-white">{data.student}</p>
          <p className="text-sm text-slate-300">Destination: {data.destination}</p>
        </div>
        <StatusBadge status={data.status} />
      </div>
      <div className="mt-3 flex items-center justify-between text-sm text-slate-300">
        <span>Seats: {data.seatCount}</span>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => onChat(data)}>
            <MessageSquareText size={14} />
            Chat
          </Button>
          <Button
            size="sm"
            onClick={() => onAccept(data)}
            disabled={data.status === 'Accepted'}
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PassengerCard
