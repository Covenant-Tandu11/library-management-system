import SignUpScreen from "./components/SignupScreen"
import LoginScreen from "./components/LoginScreen"
import Dashboard from "./components/Dashboard"
import { Routes, Route } from "react-router"
import DashboardLayout from "./components/Layouts/DashboardLayout"
import BookCatalogue from "./components/BookCatalogue"
import AddBookForm from "./components/AddBookForm"
import BorrowReturnScreen from "./components/BorrowReturnScreen"
import BookDetailsScreen from "./components/BookDetailsScreen"
import BorrowingRecords from "./components/BorrowingRecords"


function App() {
  

  return (
    <Routes>
      <Route path="/" element={<SignUpScreen/>}/>
      <Route path="/loginScreen" element={<LoginScreen/>}/>
      <Route element={<DashboardLayout/>}>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/catalogue" element={<BookCatalogue/>}/>
        <Route path="/records" element={<BorrowingRecords/>}/>
        <Route path="/addForm" element={<AddBookForm/>}/>
        <Route path="/borrowreturn" element={<BorrowReturnScreen/>}/>
        <Route path="/bookdetails/:bookId" element={<BookDetailsScreen/>}/>
      </Route>
    </Routes>
  )
}

export default App
