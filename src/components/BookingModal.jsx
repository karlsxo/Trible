import Button from './Button'

const BookingModal = ({ open, onClose, details }) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-night-950/80 px-4">
      <div className="glass w-full max-w-md rounded-3xl p-6 text-center shadow-soft">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/70">
          Booking Confirmed
        </p>
        <p className="mt-2 text-xl font-semibold text-white">
          Seat reserved with {details?.driver}
        </p>
        <p className="mt-2 text-sm text-slate-300">
          Terminal: {details?.terminal} · Seats left: {details?.seats}
        </p>
        <Button size="sm" className="mt-5" onClick={onClose}>
          Continue
        </Button>
      </div>
    </div>
  )
}

export default BookingModal
