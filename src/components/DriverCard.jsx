import { MessageSquareText, TicketCheck, X } from 'lucide-react'
import Button from './Button'
import StatusBadge from './StatusBadge'

const DriverCard = ({ data, onBook, onChat, onCancel, hasBooking }) => {
  return (
    <div className="glass flex h-full flex-col justify-between rounded-3xl p-5 shadow-soft">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <p className="min-w-0 break-words text-lg font-semibold text-white">
            {data.driver}
          </p>
          <StatusBadge status={data.status} />
        </div>
        <div className="space-y-1 text-sm text-slate-300">
          <p>Terminal: {data.terminal}</p>
          <p>Route: {data.route}</p>
          <p>Available seats: {data.seats}</p>
        </div>
      </div>
      <div className="mt-5 flex flex-col gap-2">
        {hasBooking ? (
          <Button
            size="sm"
            className="w-full bg-red-600 hover:bg-red-700"
            onClick={() => onCancel(data)}
          >
            <X size={16} />
            Cancel Booking
          </Button>
        ) : (
          <Button
            size="sm"
            className="w-full"
            onClick={() => onBook(data)}
            disabled={data.seats <= 0 || data.status !== 'Available'}
          >
            <TicketCheck size={16} />
            Book Seat
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="w-full"
          onClick={() => onChat(data)}
        >
          <MessageSquareText size={16} />
          Chat Driver
        </Button>
      </div>
    </div>
  )
}

export default DriverCard
