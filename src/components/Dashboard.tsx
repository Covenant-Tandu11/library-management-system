import { useEffect, useState } from 'react'
import {
  ArrowLeftRight,
  BookOpenText,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  Users,
} from 'lucide-react'
import { Link } from 'react-router'
import { supabase } from '../lib/supabase'
import { useBookStore } from '../zustand/useBookStore'
import { useStudent } from '../zustand/useStudentStore'
import ErrorModal from './modals/ErrorModal'

interface DashboardTransaction {
  id: string
  student_id: string
  book_id: string
  quantity: number
  borrowed_at: string
  due_date: string
  returned_at: string | null
  status: string
}

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

const Dashboard = () => {
  const { books, fetchBooks } = useBookStore()
  const { students, fetchStudents } = useStudent()
  const [transactions, setTransactions] = useState<DashboardTransaction[]>([])
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadDashboard = async () => {
      try {
        await Promise.all([fetchBooks(), fetchStudents()])
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .order('borrowed_at', { ascending: false })

        if (error) throw error
        if (isMounted) setTransactions((data ?? []) as DashboardTransaction[])
      } catch (error) {
        console.error('Unable to load dashboard data:', error)
        if (isMounted) {
          setErrorMessage(
            error instanceof Error ? error.message : 'Unable to load library activity.',
          )
        }
      }
    }

    void loadDashboard()
    return () => {
      isMounted = false
    }
  }, [fetchBooks, fetchStudents])

  const totalCopies = books.reduce((total, book) => total + book.total_copies, 0)
  const availableCopies = books.reduce(
    (total, book) => total + book.available_copies,
    0,
  )
  const borrowedCopies = Math.max(totalCopies - availableCopies, 0)
  const today = new Date().toISOString()
  const overdueCount = transactions.filter(
    (transaction) =>
      transaction.status === 'borrowed' && transaction.due_date < today,
  ).length
  const availabilityPercent =
    totalCopies > 0 ? Math.round((availableCopies / totalCopies) * 100) : 0
  const recentBooks = books.slice(0, 5)
  const recentTransactions = transactions.slice(0, 5)

  const statCards = [
    { label: 'Total Book Copies', value: totalCopies, icon: BookOpenText, color: 'bg-blue-100 text-blue-700' },
    { label: 'Available Copies', value: availableCopies, icon: CircleCheck, color: 'bg-green-100 text-green-700' },
    { label: 'Borrowed Copies', value: borrowedCopies, icon: ArrowLeftRight, color: 'bg-amber-100 text-amber-700' },
    { label: 'Overdue Books', value: overdueCount, icon: CircleAlert, color: 'bg-red-100 text-red-700' },
  ]

  return (
    <div className="space-y-6 text-[#20242B]">
      <header>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm text-[#737780]">
          Overview of library activities and key statistics
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <article
            key={label}
            className="rounded-xl border border-gray-200 bg-[#FAF8F2] p-5 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-[#737780]">{label}</p>
              <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
                <Icon size={20} />
              </span>
            </div>
            <p className="mt-4 text-3xl font-bold">{value}</p>
          </article>
        ))}
      </section>

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[1.6fr_1fr]">
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-[#FAF8F2]">
          <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
            <div>
              <h2 className="font-bold">Recent Borrowing Activity</h2>
              <p className="mt-1 text-xs text-[#737780]">Latest recorded transactions</p>
            </div>
            <Link
              to="/records"
              className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View all <ChevronRight size={16} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] border-collapse text-left">
              <thead className="bg-gray-50">
                <tr>
                  {['Student', 'Book Title', 'Borrowed On', 'Due Date', 'Status'].map((heading) => (
                    <th key={heading} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentTransactions.map((transaction) => {
                  const student = students.find((item) => item.id === transaction.student_id)
                  const book = books.find((item) => item.id === transaction.book_id)
                  const isOverdue =
                    transaction.status === 'borrowed' && transaction.due_date < today
                  const status = isOverdue ? 'Overdue' : transaction.status

                  return (
                    <tr key={transaction.id} className="transition-colors hover:bg-white/70">
                      <td className="px-4 py-4 text-sm font-medium">
                        {student?.full_name ?? 'Unknown student'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {book?.title ?? 'Book unavailable'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600">
                        {formatDate(transaction.borrowed_at)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600">
                        {formatDate(transaction.due_date)}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${
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
                {recentTransactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-500">
                      No borrowing activity yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-[#FAF8F2] p-5">
          <h2 className="font-bold">Book Availability Summary</h2>
          <div className="mt-5 flex items-center justify-between text-sm">
            <span className="text-[#737780]">Available</span>
            <span className="font-semibold">{availableCopies} / {totalCopies}</span>
          </div>
          <div
            className="mt-2 h-2.5 overflow-hidden rounded-full bg-gray-200"
            role="progressbar"
            aria-label="Available book copies"
            aria-valuenow={availabilityPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-green-500 transition-all"
              style={{ width: `${availabilityPercent}%` }}
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-white p-3">
              <p className="text-xs text-[#737780]">Available</p>
              <p className="mt-1 text-lg font-bold text-green-700">{availableCopies}</p>
            </div>
            <div className="rounded-lg bg-white p-3">
              <p className="text-xs text-[#737780]">Borrowed</p>
              <p className="mt-1 text-lg font-bold text-amber-700">{borrowedCopies}</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-[#737780]">
            {availabilityPercent}% of the library’s copies are available.
          </p>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <section className="rounded-xl border border-gray-200 bg-[#FAF8F2] p-5">
          <h2 className="font-bold">Quick Actions</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <Link
              to="/addForm"
              className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 text-sm font-semibold transition-colors hover:border-[#18212B]"
            >
              <BookOpenText size={19} className="text-blue-600" />
              Add a book
              <ChevronRight size={16} className="ml-auto text-gray-400" />
            </Link>
            <Link
              to="/borrowreturn"
              className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 text-sm font-semibold transition-colors hover:border-[#18212B]"
            >
              <ArrowLeftRight size={19} className="text-blue-600" />
              Borrow or return
              <ChevronRight size={16} className="ml-auto text-gray-400" />
            </Link>
            <Link
              to="/records"
              className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 text-sm font-semibold transition-colors hover:border-[#18212B]"
            >
              <Users size={19} className="text-blue-600" />
              Borrowing records
              <ChevronRight size={16} className="ml-auto text-gray-400" />
            </Link>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-[#FAF8F2] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-bold">Recently Added Books</h2>
              <p className="mt-1 text-xs text-[#737780]">Latest titles in the catalogue</p>
            </div>
            <Link
              to="/catalogue"
              className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View catalogue <ChevronRight size={16} />
            </Link>
          </div>
          <div className="mt-4 divide-y divide-gray-200">
            {recentBooks.map((book) => (
              <div key={book.id ?? book.isbn} className="flex items-center gap-3 py-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                  <BookOpenText size={19} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{book.title}</p>
                  <p className="truncate text-xs text-[#737780]">{book.author}</p>
                </div>
                <p className="shrink-0 text-xs text-[#737780]">
                  {book.created_at ? formatDate(book.created_at) : 'Recently added'}
                </p>
              </div>
            ))}
            {recentBooks.length === 0 && (
              <p className="py-8 text-center text-sm text-gray-500">No books have been added yet.</p>
            )}
          </div>
        </section>
      </div>

      {errorMessage && (
        <ErrorModal
          title="Could not load dashboard"
          message={errorMessage}
          onClose={() => setErrorMessage('')}
        />
      )}
    </div>
  )
}

export default Dashboard
