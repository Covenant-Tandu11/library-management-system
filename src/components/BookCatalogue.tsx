
import { useEffect, useState } from 'react'
import {
  Search,
  Eye,
  BookOpen,
} from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router'
import { useBookStore } from '../zustand/useBookStore'
import ErrorModal from './modals/ErrorModal'
// import type { Books } from '../types/addBooks'

const BookCatalogue = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { books, fetchBooks } = useBookStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [loadError, setLoadError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const selectedCategory = searchParams.get('category') ?? ''

  useEffect(() => {
    let isMounted = true

    fetchBooks().catch((error: unknown) => {
      if (isMounted) {
        setLoadError(
          typeof error === 'object' && error !== null && 'message' in error
            ? String(error.message)
            : 'Unable to load books from the catalogue.',
        )
      }
    }).finally(() => {
      if (isMounted) setIsLoading(false)
    })

    return () => {
      isMounted = false
    }
  }, [fetchBooks])

  const totalCopies = books.reduce(
    (total, book) => total + book.total_copies,
    0
  )

  const availableCopies = books.reduce(
    (total, book) => total + book.available_copies,
    0
  )

  const borrowedCopies = totalCopies - availableCopies

  const filteredBooks = books.filter((book) =>
    (!selectedCategory || book.category === selectedCategory) &&
    `${book.title} ${book.author} ${book.isbn}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )

  return (
    <>
    <div className="min-w-0 space-y-5 sm:space-y-6">

      {/* Heading */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Book Catalogue
        </h1>

        <p className="mt-1 font-medium text-[#737780]">
          View and manage all books in the library
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

        <div className="rounded-xl border border-gray-200 bg-[#FAF8F2] p-4 sm:p-5">
          <p className="text-sm font-medium text-[#737780]">
            Total Book Titles
          </p>

          <h2 className="mt-3 text-3xl font-bold text-gray-900">
            {books.length}
          </h2>
        </div>

        <div className="rounded-xl border border-gray-200 bg-[#FAF8F2] p-4 sm:p-5">
          <p className="text-sm font-medium text-[#737780]">
            Total Copies
          </p>

          <h2 className="mt-3 text-3xl font-bold text-gray-900">
            {totalCopies}
          </h2>
        </div>

        <div className="rounded-xl border border-gray-200 bg-[#FAF8F2] p-4 sm:p-5">
          <p className="text-sm font-medium text-[#737780]">
            Borrowed Copies
          </p>

          <h2 className="mt-3 text-3xl font-bold text-gray-900">
            {borrowedCopies}
          </h2>
        </div>

      </div>

      {/* Catalogue */}
      <div className="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-[#FAF8F2]">

        {/* Search */}
        <div className="border-b border-gray-200 p-3 sm:p-5">
          <div className="relative w-full sm:max-w-sm">
            <Search
              size={19}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search books..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#356AE6] sm:py-3"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">

            <thead className="bg-gray-100">
              <tr>
                <th className="px-5 py-4 text-xs font-semibold uppercase text-gray-500">
                  Book Title
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase text-gray-500">
                  Author
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase text-gray-500">
                  Category
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase text-gray-500">
                  Total Copies
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase text-gray-500">
                  Borrowed
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase text-gray-500">
                  Available
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase text-gray-500">
                  Status
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">

              {filteredBooks.map((book, index) => {
                const borrowed =
                  book.total_copies - book.available_copies

                return (
                  <tr
                    key={book.id ?? `${book.isbn}-${index}`}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="px-3 py-4 text-sm font-semibold text-gray-800 sm:px-5">
                      {book.title}
                    </td>

                    <td className="px-3 py-4 text-sm text-gray-600 sm:px-5">
                      {book.author}
                    </td>

                    <td className="px-3 py-4 text-sm capitalize text-gray-600 sm:px-5">
                      {book.category}
                    </td>

                    <td className="px-3 py-4 text-sm text-gray-600 sm:px-5">
                      {book.total_copies}
                    </td>

                    <td className="px-3 py-4 text-sm text-gray-600 sm:px-5">
                      {borrowed}
                    </td>

                    <td className="px-3 py-4 text-sm font-semibold text-gray-800 sm:px-5">
                      {book.available_copies}
                    </td>

                    <td className="px-3 py-4 sm:px-5">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          book.available_copies > 0
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {book.available_copies > 0
                          ? 'Available'
                          : 'All Borrowed'}
                      </span>
                    </td>

                    <td className="px-3 py-4 sm:px-5">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          aria-label={`View ${book.title}`}
                          disabled={!book.id}
                          onClick={() => book.id && navigate(`/bookdetails/${book.id}`)}
                          className="rounded p-1 text-gray-400 transition-colors hover:bg-blue-50 hover:text-[#356AE6] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Eye size={19} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}

              {isLoading && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-sm text-gray-500">
                    Loading books...
                  </td>
                </tr>
              )}

              {!isLoading && filteredBooks.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center">
                    <BookOpen
                      size={35}
                      className="mx-auto mb-3 text-gray-300"
                    />

                    <p className="font-semibold text-gray-700">
                      No books found
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Your books will appear here once added.
                    </p>
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>

        <div className="border-t border-gray-200 px-5 py-4">
          <p className="text-xs text-[#737780] sm:text-sm">
            Showing {filteredBooks.length} of {books.length} book titles
          </p>
        </div>

      </div>
    </div>
    {loadError && (
      <ErrorModal
        title="Could not load catalogue"
        message={loadError}
        onClose={() => setLoadError('')}
      />
    )}
    </>
  )
}

export default BookCatalogue
