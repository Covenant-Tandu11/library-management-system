import { AlertCircle, X } from 'lucide-react'

interface ErrorModalProps {
  title?: string
  message: string
  onClose: () => void
}

const ErrorModal = ({
  title = 'Something went wrong',
  message,
  onClose,
}: ErrorModalProps) => (
  <div
    className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-[#18212B]/60 p-3 sm:p-5"
    role="presentation"
    onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}
  >
    <section
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="error-modal-title"
      aria-describedby="error-modal-message"
      className="relative my-auto w-full max-w-md rounded-xl border border-gray-200 bg-[#FAF8F2] px-5 py-7 text-center shadow-xl sm:px-6 sm:py-8"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close error message"
        className="absolute right-4 top-4 rounded p-1 text-gray-500 hover:bg-gray-100"
      >
        <X size={20} />
      </button>
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
        <AlertCircle size={34} />
      </div>
      <h2 id="error-modal-title" className="mt-4 text-lg font-bold text-[#20242B] sm:text-xl">
        {title}
      </h2>
      <p id="error-modal-message" className="mt-2 text-sm leading-6 text-[#737780]">
        {message}
      </p>
      <button
        type="button"
        onClick={onClose}
        className="mt-6 w-full rounded-lg bg-[#18212B] px-4 py-2.5 text-sm font-medium text-[#FAF8F2] transition-colors hover:bg-[#293746]"
      >
        Close
      </button>
    </section>
  </div>
)

export default ErrorModal
