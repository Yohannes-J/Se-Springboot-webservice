import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import Home from "./pages/Home";
import Books from "./pages/Books";
import Borrow from "./pages/Borrow";
import Navbar from "./components/Navbar";
import ReturnBook from "./pages/RetunBook";
import AssignRole from "./pages/AssignRole";
import AdminDashboard from "./pages/AdminDashboard";
import Penality from "./pages/Penalty";
import Customer from "./pages/Customer";
import AddBook from "./pages/AddBook";



// 1. This component checks if the user is logged in
function ProtectedRoute({ children }) {
  // It looks for the "token" you set during login
  const isAuthenticated = localStorage.getItem("token"); 
  
  if (!isAuthenticated) {
    // If no token, send them back to the Login page ("/")
    return <Navigate to="/" replace />;
  }
  return children;
}

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <div className="pt-20 p-4">{children}</div>
    </>
  );
}

function AppWrapper() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/";

  return (
    <Routes>
      {/* Public Route */}
      <Route path="/" element={<AuthPage />} />

      {/* 2. Wrap all private routes inside the ProtectedRoute */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/dashboard" element={<Home />} />
                <Route path="/customer" element={<Customer />} />
                <Route path="/books" element={<Books />} />
                <Route path="/borrow" element={<Borrow />} />
                <Route path="/return" element={<ReturnBook />} />
                <Route path="/assign-role" element={<AssignRole />} />
                <Route path="/penality" element={<Penality />} />
                <Route path="/books/add" element={<AddBook />} />
                <Route path="*" element={<div>404 Not Found</div>} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}