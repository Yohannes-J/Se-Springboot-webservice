import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import Home from "./pages/Home";
import Users from "./pages/Users";
import Books from "./pages/Books";
import Borrow from "./pages/Borrow";
import Navbar from "./components/Navbar";
import ReturnBook from "./pages/RetunBook";
import AssignRole from "./pages/AssignRole";
import AdminDashboard from "./pages/AdminDashboard";
import Penality from "./pages/Penality";

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <div className="p-4">{children}</div>
    </>
  );
}

function AppWrapper() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/";

  return hideNavbar ? (
    <Routes>
      <Route path="/" element={<AuthPage />} />
    </Routes>
  ) : (
    <Layout>
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/dashboard" element={<Home />} />
        <Route path="/users" element={<Users />} />
        <Route path="/books" element={<Books />} />
        <Route path="/borrow" element={<Borrow />} />
        <Route path="/return" element={<ReturnBook />} />
        <Route path="/assign-role" element={<AssignRole />} />
        <Route path="/penality" element={<Penality />} />
        
        <Route path="/404" element={<div>404 Not Found</div>} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}