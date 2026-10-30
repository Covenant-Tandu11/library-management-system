import { useEffect, useState } from 'react'
import { ArrowLeft, BookOpen, Clock3, FileText } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { supabase } from '../lib/supabase'
import { useBookStore } from '../zustand/useBookStore'
import { useStudent } from '../zustand/useStudentStore'
import ErrorModal from './modals/ErrorModal'

interface BookTransaction {
  id: string
  student_id: string
  book_id: string
  borrowed_at: string
  due_date: string
  returned_at: string | null
  status: string
  quantity: number
}

const formatDate = (date: string | null | undefined) => {
  if (!date) return '—'
  const parsedDate = new Date(date)
  return Number.isNaN(parsedDate.getTime())
    ? '—'
    : parsedDate.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
}

const BookDetailsScreen = () => {
  const { bookId } = useParams<{ bookId: string }>()
  const { books, fetchBooks } = useBookStore()
  const { students, fetchStudents } = useStudent()
  const [history, setHistory] = useState<BookTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadBookDetails = async () => {
      try {
        await Promise.all([fetchBooks(), fetchStudents()])
        if (!bookId) return

        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('book_id', bookId)
          .order('borrowed_at', { ascending: false })

        if (error) throw error
        if (isMounted) setHistory((data ?? []) as BookTransaction[])
      } catch (error) {
        console.error('Unable to load book details:', error)
        if (isMounted) {
          setErrorMessage(
            error instanceof Error ? error.message : 'Unable to load this book’s details.',
          )
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    void loadBookDetails()
    return () => {
      isMounted = false
    }
  }, [bookId, fetchBooks, fetchStudents])

  const book = books.find((item) => item.id === bookId)
  const totalCopies = book?.total_copies ?? 0
  const availableCopies = book?.available_copies ?? 0
  const borrowedCopies = Math.max(totalCopies - availableCopies, 0)
  const today = new Date().toISOString()

  if (isLoading) {
    return <p className="rounded-xl border border-gray-200 bg-[#FAF8F2] p-8 text-center text-sm text-[#737780]">Loading book details...</p>
  }

  if (!book) {
    return (
      <div className="space-y-5">
        <Link
          to="/catalogue"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#737780] transition-colors hover:text-blue-600"
        >
          <ArrowLeft size={16} />
          Back to Catalogue
        </Link>
        <section className="rounded-xl border border-gray-200 bg-[#FAF8F2] p-8 text-center">
          <BookOpen size={36} className="mx-auto mb-3 text-gray-300" />
          <h1 className="text-xl font-bold text-[#20242B]">Book not found</h1>
          <p className="mt-2 text-sm text-[#737780]">
            This book may have been removed or is no longer available.
          </p>
        </section>
        {errorMessage && (
          <ErrorModal
            title="Could not load book details"
            message={errorMessage}
            onClose={() => setErrorMessage('')}
          />
        )}
      </div>
    )
  }

  return (
    <div className="min-w-0 space-y-5 text-[#20242B]">
      <Link
        to="/catalogue"
        className="inline-flex items-center gap-2 text-sm font-medium text-[#737780] transition-colors hover:text-blue-600"
      >
        <ArrowLeft size={16} />
        Back to Catalogue
      </Link>

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[1.35fr_1fr]">
        <section className="min-w-0 rounded-xl border border-gray-200 bg-[#FAF8F2] p-5">
          <div className="flex flex-col gap-5 sm:flex-row">
            {book.cover_image_url ? (
              <img
                src={book.cover_image_url}
                alt={`Cover of ${book.title}`}
                className="h-44 w-32 shrink-0 rounded-md object-cover shadow-md"
              />
            ) : (
              <div className="flex h-44 w-32 shrink-0 flex-col justify-between rounded-md bg-[#18212B] p-3 text-white shadow-md">
                <BookOpen size={20} />
                <div>
                  <div className="mb-2 h-1 w-12 bg-blue-400" />
                  <p className="line-clamp-3 text-xs font-bold">{book.title}</p>
                  <p className="mt-1 line-clamp-2 text-[9px] text-gray-300">
                    {book.author}
                  </p>
                </div>
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold">{book.title}</h1>
              <p className="mt-1 text-sm text-[#737780]">By {book.author}</p>
              <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                availableCopies > 0
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-600'
              }`}>
                {availableCopies > 0 ? 'Available' : 'All Borrowed'}
              </span>

              <dl className="mt-5 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-[#737780]">ISBN</dt>
                  <dd className="mt-1 break-words font-medium">{book.isbn}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[#737780]">Category</dt>
                  <dd className="mt-1 capitalize font-medium">{book.category}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[#737780]">Publisher</dt>
                  <dd className="mt-1 font-medium">{book.publisher}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[#737780]">Publication Year</dt>
                  <dd className="mt-1 font-medium">{book.publication_year ?? '—'}</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <section className="min-w-0 rounded-xl border border-gray-200 bg-[#FAF8F2] p-5">
          <h2 className="font-bold">Copy Availability</h2>
          <p className="mt-1 text-sm text-[#737780]">
            {totalCopies} {totalCopies === 1 ? 'copy' : 'copies'} in the library
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-white p-4">
              <p className="text-xs text-[#737780]">Available</p>
              <p className="mt-1 text-2xl font-bold text-green-700">{availableCopies}</p>
            </div>
            <div className="rounded-lg bg-white p-4">
              <p className="text-xs text-[#737780]">Borrowed</p>
              <p className="mt-1 text-2xl font-bold text-red-600">{borrowedCopies}</p>
            </div>
          </div>
          <div
            className="mt-4 h-2.5 overflow-hidden rounded-full bg-gray-200"
            role="progressbar"
            aria-label="Available copies"
            aria-valuenow={totalCopies > 0 ? Math.round((availableCopies / totalCopies) * 100) : 0}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-green-500"
              style={{ width: `${totalCopies > 0 ? (availableCopies / totalCopies) * 100 : 0}%` }}
            />
          </div>
          <Link
            to="/borrowreturn"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#18212B] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#293746]"
          >
            <BookOpen size={16} />
            Record a Borrow or Return
          </Link>
        </section>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[1.35fr_1fr]">
        <section className="min-w-0 rounded-xl border border-gray-200 bg-[#FAF8F2] p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-bold">Borrowing History</h2>
              <p className="mt-1 text-xs text-[#737780]">
                Transaction history for this title
              </p>
            </div>
            <span className="text-xs font-medium text-blue-600">
              {history.length} {history.length === 1 ? 'record' : 'records'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[570px] text-left text-xs">
              <thead className="bg-gray-100 text-gray-500">
                <tr>
                  {['Student', 'Borrowed On', 'Due Date', 'Returned On', 'Status'].map((heading) => (
                    <th key={heading} className="px-3 py-3 font-medium">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {history.map((record) => {
                  const student = students.find((item) => item.id === record.student_id)
                  const isOverdue = record.status === 'borrowed' && record.due_date < today
                  const status = isOverdue ? 'Overdue' : record.status

                  return (
                    <tr key={record.id} className="hover:bg-white/60">
                      <td className="px-3 py-4 font-medium">
                        {student?.full_name ?? 'Unknown student'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-gray-600">
                        {formatDate(record.borrowed_at)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-gray-600">
                        {formatDate(record.due_date)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-gray-600">
                        {formatDate(record.returned_at)}
                      </td>
                      <td className="px-3 py-4">
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                          isOverdue
                            ? 'bg-red-100 text-red-700'
                            : status === 'borrowed'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                        }`}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
                {history.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-gray-500">
                      No borrowing history for this book yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Link
            to="/records"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View all borrowing records
            <ArrowLeft size={14} className="rotate-180" />
          </Link>
        </section>

        <section className="min-w-0 rounded-xl border border-gray-200 bg-[#FAF8F2] p-5">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-blue-600" />
            <h2 className="font-bold">Book Activity</h2>
          </div>
          <div className="mt-4 rounded-lg bg-white p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock3 size={16} className="text-blue-600" />
              Catalogue details
            </div>
            <dl className="mt-3 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-[#737780]">Added to catalogue</dt>
                <dd className="text-right font-medium">{formatDate(book.created_at)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#737780]">Last updated</dt>
                <dd className="text-right font-medium">{formatDate(book.updated_at)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#737780]">Total transactions</dt>
                <dd className="text-right font-medium">{history.length}</dd>
              </div>
            </dl>
          </div>
        </section>
      </div>

      {errorMessage && (
        <ErrorModal
          title="Could not load book details"
          message={errorMessage}
          onClose={() => setErrorMessage('')}
        />
      )}
    </div>
  )
}

export default BookDetailsScreen
