import { useEffect, useState } from 'react'
import { BookOpen, Search } from 'lucide-react'
import ErrorModal from './modals/ErrorModal'
import { useBookStore } from '../zustand/useBookStore'
import { useStudent } from '../zustand/useStudentStore'
import { supabase } from '../lib/supabase'

interface BorrowingTransaction {
  id: string
  student_id: string
  book_id: string
  borrowed_at: string
  due_date: string
  returned_at: string | null
  status: string
  quantity: number
}

const formatDate = (date: string | null) => {
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

const BorrowingRecords = () => {
  const { books, fetchBooks } = useBookStore()
  const { students, fetchStudents } = useStudent()
  const [transactions, setTransactions] = useState<BorrowingTransaction[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadRecords = async () => {
      try {
        await Promise.all([fetchBooks(), fetchStudents()])
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .order('borrowed_at', { ascending: false })

        if (error) throw error
        if (isMounted) setTransactions((data ?? []) as BorrowingTransaction[])
      } catch (error) {
        console.error('Unable to load borrowing records:', error)
        if (isMounted) {
          setErrorMessage(
            error instanceof Error ? error.message : 'Unable to load borrowing records.',
          )
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    void loadRecords()
    return () => {
      isMounted = false
    }
  }, [fetchBooks, fetchStudents])

  const today = new Date().toISOString()
  const filteredTransactions = transactions.filter((transaction) => {
    const student = students.find((item) => item.id === transaction.student_id)
    const book = books.find((item) => item.id === transaction.book_id)
    const searchableText = [
      student?.full_name,
      student?.student_id,
      book?.title,
      transaction.status,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return searchableText.includes(searchTerm.toLowerCase())
  })

  return (
    <div className="space-y-6 text-[#20242B]">
      <header>
        <h1 className="text-3xl font-bold">Borrowing Records</h1>
        <p className="mt-1 text-sm text-[#737780]">
          Track books borrowed by students and their due dates
        </p>
      </header>

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-[#FAF8F2]">
        <div className="flex flex-col gap-4 border-b border-gray-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold">All Transactions</h2>
            <p className="mt-1 text-xs text-[#737780]">
              {transactions.length} {transactions.length === 1 ? 'record' : 'records'}
            </p>
          </div>
          <label className="relative block w-full sm:max-w-xs">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search student or book..."
              className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-blue-500"
            />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead className="bg-gray-50">
              <tr>
                {['Student', 'Book Title', 'Copies', 'Borrowed On', 'Due Date', 'Returned On', 'Status'].map((heading) => (
                  <th key={heading} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTransactions.map((transaction) => {
                const student = students.find((item) => item.id === transaction.student_id)
                const book = books.find((item) => item.id === transaction.book_id)
                const isOverdue =
                  transaction.status === 'borrowed' && transaction.due_date < today
                const status = isOverdue ? 'Overdue' : transaction.status

                return (
                  <tr key={transaction.id} className="transition-colors hover:bg-white/70">
                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold">
                        {student?.full_name ?? 'Unknown student'}
                      </p>
                      {student?.student_id && (
                        <p className="mt-1 text-xs text-[#737780]">{student.student_id}</p>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {book?.title ?? 'Book unavailable'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">{transaction.quantity ?? 1}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600">
                      {formatDate(transaction.borrowed_at)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600">
                      {formatDate(transaction.due_date)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600">
                      {formatDate(transaction.returned_at)}
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

              {isLoading && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-500">
                    Loading borrowing records...
                  </td>
                </tr>
              )}
              {!isLoading && filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <BookOpen size={32} className="mx-auto mb-3 text-gray-300" />
                    <p className="font-semibold text-gray-700">
                      {searchTerm ? 'No matching records' : 'No borrowing records yet'}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm
                        ? 'Try another student name or book title.'
                        : 'Borrowing transactions will appear here.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {errorMessage && (
        <ErrorModal
          title="Could not load borrowing records"
          message={errorMessage}
          onClose={() => setErrorMessage('')}
        />
      )}
    </div>
  )
}

export default BorrowingRecords
