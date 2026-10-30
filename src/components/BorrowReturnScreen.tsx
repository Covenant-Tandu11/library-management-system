
import { useEffect, useState, type FormEvent } from "react";
import {
  BookOpen,
  UserRound,
  CalendarDays,
  ArrowLeftRight,
  CircleCheck,
} from "lucide-react";
import { useNavigate } from "react-router";
import SuccessModal from "./modals/SuccessModal";
import { supabase } from "../lib/supabase";
import { useStudent } from "../zustand/useStudentStore";
import { useBookStore } from "../zustand/useBookStore";

type TabType = "borrow" | "return";

interface Student {
  id: string;
  student_id: string;
  full_name: string;
  department: string;
  email: string;
}

interface Transaction {
  id: string;
  student_id: string;
  book_id: string;
  quantity: number;
  borrowed_at: string;
  due_date: string;
  returned_at: string | null;
  status: string;
}

const BorrowReturnScreen = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabType>("borrow");

  const [showBorrowSuccess, setShowBorrowSuccess] = useState(false);
  const [showReturnSuccess, setShowReturnSuccess] = useState(false);

  // Student form
  const [studentId, setStudentId] = useState("");
  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("");
  const [email, setEmail] = useState("");

  // Book and borrowing details
  const [selectedBookId, setSelectedBookId] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [borrowDate, setBorrowDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dueDate, setDueDate] = useState("");

  // Return details
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransactionId, setSelectedTransactionId] = useState("");

  const [returnDate, setReturnDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { students, fetchStudents, addStudents } = useStudent();
  const { books, fetchBooks } = useBookStore();

  const inputClass =
    "w-full min-w-0 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-[#172033] outline-none transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  const labelClass =
    "mb-1.5 block text-xs font-medium text-[#172033]";

  const selectedBook = books.find(
    (book) => book.id === selectedBookId
  );

  const selectedTransaction = transactions.find(
    (transaction) => transaction.id === selectedTransactionId
  );

  const returnStudent = students.find(
    (student) => student.id === selectedTransaction?.student_id
  );

  const returnBook = books.find(
    (book) => book.id === selectedTransaction?.book_id
  );
  // Fetch transactions that have not been returned
  const fetchActiveTransactions = async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("status", "borrowed")
      .order("borrowed_at", { ascending: false });

    if (error) throw error;

    setTransactions((data ?? []) as Transaction[]);
  };


  // Fetch students, books and active transactions
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchStudents(), fetchBooks()]);
        await fetchActiveTransactions();
      } catch (error) {
        console.error("Error loading borrowing data:", error);
      }
    };

    loadData();
  }, [fetchStudents, fetchBooks]);

  
  // Handle borrowing
  const handleBorrow = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setErrorMessage("");

    const formData = new FormData(event.currentTarget);

    // Collect student information from the form
    const studentData = {
      student_id: String(formData.get("student_id") ?? "").trim(),
      full_name: String(formData.get("full_name") ?? "").trim(),
      department: String(formData.get("department") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
    };

    if (
      !studentData.student_id ||
      !studentData.full_name ||
      !studentData.department ||
      !studentData.email
    ) {
      setErrorMessage("Please complete all student information.");
      return;
    }

    if (!selectedBook) {
      setErrorMessage("Please select a book.");
      return;
    }

    if (
      quantity < 1 ||
      quantity > selectedBook.available_copies
    ) {
      setErrorMessage("The requested quantity is not available.");
      return;
    }

    if (!dueDate || dueDate < borrowDate) {
      setErrorMessage("Please select a valid due date.");
      return;
    }

    setLoading(true);

    try {
      // Check whether the student already exists
      const existingStudent = students.find(
        (student) =>
          student.student_id.toLowerCase() ===
          studentData.student_id.toLowerCase()
      );

      let studentRecord: Student;

      if (existingStudent) {
        // Use the existing student record
        studentRecord = existingStudent;
      } else {
        // Insert the new student through Zustand
        await addStudents(studentData);
        const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession()

console.log("Session:", sessionData.session)
console.log("User:", sessionData.session?.user)
console.log("Session error:", sessionError)

        // Fetch the updated student list
        await fetchStudents();

        // Find the newly inserted student to get their UUID
        const { data: newStudent, error: studentError } =
          await supabase
            .from("students")
            .select("*")
            .eq("student_id", studentData.student_id)
            .single();

        if (studentError) throw studentError;

        studentRecord = newStudent as Student;
      }

      // Create borrowing transaction
      const { error: transactionError } = await supabase
        .from("transactions")
        .insert({
          student_id: studentRecord.id,
          book_id: selectedBook.id,
          quantity,
          borrowed_at: new Date(
            `${borrowDate}T12:00:00`
          ).toISOString(),
          due_date: new Date(
            `${dueDate}T23:59:59`
          ).toISOString(),
          status: "borrowed",
        });

      if (transactionError) throw transactionError;

      // Reduce available copies
      const { error: bookError } = await supabase
        .from("books")
        .update({
          available_copies:
            selectedBook.available_copies - quantity,
        })
        .eq("id", selectedBook.id);

      if (bookError) {
        throw new Error(
          "The transaction was saved, but the book quantity could not be updated. Please contact the administrator."
        );
      }

      // Refresh data
      await Promise.all([fetchStudents(), fetchBooks()]);
      await fetchActiveTransactions();

      // Reset form
      setStudentId("");
      setFullName("");
      setDepartment("");
      setEmail("");
      setSelectedBookId("");
      setQuantity(1);
      setDueDate("");

      setShowBorrowSuccess(true);
    } catch (error) {
      console.error("Borrowing error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to complete borrowing. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle returning a book
  const handleReturn = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setErrorMessage("");

    if (!selectedTransaction || !returnBook) {
      setErrorMessage(
        "Please select a valid borrowing transaction."
      );
      return;
    }

    setLoading(true);

    try {
      // Update the original transaction
      const { data: updatedTransaction, error: transactionError } =
        await supabase
          .from("transactions")
          .update({
            returned_at: new Date(
              `${returnDate}T12:00:00`
            ).toISOString(),
            status: "returned",
          })
          .eq("id", selectedTransaction.id)
          .eq("status", "borrowed")
          .select("id")
          .maybeSingle();

      if (transactionError) throw transactionError;

      if (!updatedTransaction) {
        throw new Error(
          "This transaction has already been returned or could not be found."
        );
      }

      // Restore available copies
      const { error: bookError } = await supabase
        .from("books")
        .update({
          available_copies:
            returnBook.available_copies +
            selectedTransaction.quantity,
        })
        .eq("id", returnBook.id);

      if (bookError) {
        throw new Error(
          "The return was recorded, but the available book quantity could not be updated. Please contact the administrator."
        );
      }

      await Promise.all([fetchBooks(), fetchStudents()]);
      await fetchActiveTransactions();

      setSelectedTransactionId("");
      setShowReturnSuccess(true);
    } catch (error) {
      console.error("Return error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to complete return. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-[#172033]">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Borrow / Return</h1>
        <p className="mt-1 text-sm text-[#737780]">
          Manage book loans and returns
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 sm:gap-6">
        <button
          type="button"
          onClick={() => {
            setActiveTab("borrow");
            setErrorMessage("");
          }}
          className={`border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
            activeTab === "borrow"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-[#737780] hover:text-[#18212B]"
          }`}
        >
          Borrow Book
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("return");
            setErrorMessage("");
          }}
          className={`border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
            activeTab === "return"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-[#737780] hover:text-[#18212B]"
          }`}
        >
          Return Book
        </button>
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {/* BORROW BOOK FORM */}
      {activeTab === "borrow" && (
        <form
          onSubmit={handleBorrow}
          className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2 2xl:grid-cols-3"
        >
          {/* Student Information */}
          <section className="min-w-0 rounded-xl border border-gray-200 bg-[#FAF8F2] p-4 sm:p-5">
            <div className="mb-5 flex items-center gap-2">
              <UserRound size={18} className="text-blue-600" />
              <h2 className="text-sm font-semibold">
                1. Student Information
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="student-id" className={labelClass}>
                  Student ID
                </label>
                <input
                  id="student-id"
                  name="student_id"
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className={inputClass}
                  placeholder="Enter student ID"
                  required
                />
              </div>

              <div>
                <label htmlFor="full-name" className={labelClass}>
                  Full Name
                </label>
                <input
                  id="full-name"
                  name="full_name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={inputClass}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div>
                <label htmlFor="department" className={labelClass}>
                  Department
                </label>
                <input
                  id="department"
                  name="department"
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className={inputClass}
                  placeholder="Enter department"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className={labelClass}>
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="Enter email address"
                  required
                />
              </div>
            </div>
          </section>

          {/* Book Information */}
          <section className="min-w-0 rounded-xl border border-gray-200 bg-[#FAF8F2] p-4 sm:p-5">
            <div className="mb-5 flex items-center gap-2">
              <BookOpen size={18} className="text-blue-600" />
              <h2 className="text-sm font-semibold">
                2. Book Information
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="book-id" className={labelClass}>
                  Select Book
                </label>

                <select
                  id="book-id"
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className={inputClass}
                  required
                >
                  <option value="">Select a book</option>

                  {books
                    .filter((book) => book.available_copies > 0)
                    .map((book) => (
                      <option key={book.id} value={book.id}>
                        {book.title} ({book.available_copies} available)
                      </option>
                    ))}
                </select>
              </div>

              {selectedBook && (
                <div className="space-y-2 rounded-lg bg-blue-50 p-3">
                  <p className="text-sm">
                    <strong>Title:</strong> {selectedBook.title}
                  </p>
                  <p className="text-sm">
                    <strong>Author:</strong> {selectedBook.author}
                  </p>
                  <p className="text-sm">
                    <strong>Available Copies:</strong>{" "}
                    {selectedBook.available_copies}
                  </p>
                </div>
              )}

              <div>
                <label htmlFor="book-copies" className={labelClass}>
                  Number of Copies
                </label>

                <input
                  id="book-copies"
                  type="number"
                  min="1"
                  max={selectedBook?.available_copies ?? 1}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Number(e.target.value))
                  }
                  className={inputClass}
                  required
                />
              </div>
            </div>
          </section>

          {/* Loan Details */}
          <section className="min-w-0 rounded-xl border border-gray-200 bg-[#FAF8F2] p-4 sm:p-5 lg:col-span-2 2xl:col-span-1">
            <div className="mb-5 flex items-center gap-2">
              <CalendarDays size={18} className="text-blue-600" />
              <h2 className="text-sm font-semibold">
                3. Loan Details
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="borrow-date" className={labelClass}>
                  Borrowing Date
                </label>
                <input
                  id="borrow-date"
                  type="date"
                  value={borrowDate}
                  onChange={(e) => setBorrowDate(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label htmlFor="due-date" className={labelClass}>
                  Due Date
                </label>
                <input
                  id="due-date"
                  type="date"
                  min={borrowDate}
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>

              <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
                <p className="text-xs leading-5 text-blue-800">
                  Check that the student and book details are correct
                  before confirming the loan.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#18212B] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#293746] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <BookOpen size={16} />
                {loading ? "Processing..." : "Confirm Borrowing"}
              </button>
            </div>
          </section>
        </form>
      )}

      {/* RETURN BOOK FORM */}
      {activeTab === "return" && (
        <form
          onSubmit={handleReturn}
          className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2"
        >
          {/* Student and Book Information */}
          <section className="min-w-0 rounded-xl border border-gray-200 bg-[#FAF8F2] p-4 sm:p-5">
            <div className="mb-5 flex items-center gap-2">
              <UserRound size={18} className="text-blue-600" />
              <h2 className="text-sm font-semibold">
                1. Borrowing Transaction
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="return-transaction"
                  className={labelClass}
                >
                  Select Active Transaction
                </label>

                <select
                  id="return-transaction"
                  value={selectedTransactionId}
                  onChange={(e) =>
                    setSelectedTransactionId(e.target.value)
                  }
                  className={inputClass}
                  required
                >
                  <option value="">
                    Select a borrowing transaction
                  </option>

                  {transactions.map((transaction) => {
                    const student = students.find(
                      (item) => item.id === transaction.student_id
                    );

                    const book = books.find(
                      (item) => item.id === transaction.book_id
                    );

                    return (
                      <option
                        key={transaction.id}
                        value={transaction.id}
                      >
                        {student?.student_id ?? "Student"} -{" "}
                        {book?.title ?? "Book"} (
                        {transaction.quantity} copies)
                      </option>
                    );
                  })}
                </select>
              </div>

              {selectedTransaction && (
                <div className="space-y-3 rounded-lg bg-blue-50 p-3">
                  <p className="text-sm font-semibold text-blue-800">
                    Student Information
                  </p>

                  <p className="text-sm">
                    <strong>Student ID:</strong>{" "}
                    {returnStudent?.student_id ?? "Not found"}
                  </p>

                  <p className="text-sm">
                    <strong>Full Name:</strong>{" "}
                    {returnStudent?.full_name ?? "Not found"}
                  </p>

                  <p className="text-sm">
                    <strong>Department:</strong>{" "}
                    {returnStudent?.department ?? "Not found"}
                  </p>

                  <div className="border-t border-blue-200 pt-3">
                    <p className="text-sm font-semibold text-blue-800">
                      Book Information
                    </p>

                    <p className="mt-2 text-sm">
                      <strong>Book Title:</strong>{" "}
                      {returnBook?.title ?? "Not found"}
                    </p>

                    <p className="text-sm">
                      <strong>Author:</strong>{" "}
                      {returnBook?.author ?? "Not found"}
                    </p>

                    <p className="text-sm">
                      <strong>Copies Borrowed:</strong>{" "}
                      {selectedTransaction.quantity}
                    </p>
                  </div>
                </div>
              )}

              {transactions.length === 0 && (
                <p className="rounded-lg bg-gray-100 p-3 text-sm text-gray-600">
                  There are currently no active borrowing transactions.
                </p>
              )}
            </div>
          </section>

          {/* Return Details */}
          <section className="min-w-0 rounded-xl border border-gray-200 bg-[#FAF8F2] p-4 sm:p-5">
            <div className="mb-5 flex items-center gap-2">
              <CalendarDays size={18} className="text-blue-600" />
              <h2 className="text-sm font-semibold">
                2. Return Details
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="actual-return-date"
                  className={labelClass}
                >
                  Actual Return Date
                </label>

                <input
                  id="actual-return-date"
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>

              <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
                <p className="text-xs leading-5 text-blue-800">
                  Verify the student's details and borrowed book before
                  recording the return.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !selectedTransaction}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#18212B] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#293746] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ArrowLeftRight size={16} />
                {loading ? "Processing..." : "Confirm Return"}
              </button>
            </div>
          </section>
        </form>
      )}

      {/* BOOK BORROWED SUCCESS MODAL */}
      {showBorrowSuccess && (
        <SuccessModal
          icon={<CircleCheck size={48} />}
          iconBackgroundColor="bg-green-100"
          iconColor="text-green-600"
          title="Book Borrowed Successfully!"
          subtitle="The book has been issued to the student."
          message="The borrowing transaction has been recorded."
          primaryButtonText="View Borrowing Records"
          secondaryButtonText="Borrow Another Book"
          showSidebar
          onPrimaryClick={() => {
            setShowBorrowSuccess(false);
            navigate("/records");
          }}
          onSecondaryClick={() => {
            setShowBorrowSuccess(false);
            setActiveTab("borrow");
          }}
        >
          <div>
            <p className="font-medium">
              Borrowing recorded successfully.
            </p>
            <p className="mt-1 text-xs">
              You can view the transaction details in the borrowing records.
            </p>
          </div>
        </SuccessModal>
      )}

      {/* BOOK RETURNED SUCCESS MODAL */}
      {showReturnSuccess && (
        <SuccessModal
          icon={<CircleCheck size={48} />}
          iconBackgroundColor="bg-green-100"
          iconColor="text-green-600"
          title="Book Returned Successfully!"
          subtitle="The book has been returned and is now available for other students."
          primaryButtonText="View Book Details"
          secondaryButtonText="Record Another Return"
          showSidebar
          onPrimaryClick={() => {
            setShowReturnSuccess(false);
            navigate("/catalogue");
          }}
          onSecondaryClick={() => {
            setShowReturnSuccess(false);
            setActiveTab("return");
          }}
        />
      )}
    </div>
  );
};

export default BorrowReturnScreen;
