import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import AuthPage from "./pages/AuthPage";
import Home from "./pages/Home";
import Books from "./pages/Books";
import Borrow from "./pages/Borrow";
import ReturnBook from "./pages/RetunBook";
import AssignRole from "./pages/AssignRole";
import AdminDashboard from "./pages/AdminDashboard";
import Penality from "./pages/Penalty";
import Customer from "./pages/Customer";
import AddBook from "./pages/AddBook";
import Material from "./pages/Material";
import DigitalMaterial from "./pages/DigitalMaterial";
import Reservation from "./pages/Reservation";

import Navbar from "./components/Navbar";

/* ===================== PROTECTED ROUTE ===================== */
function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role")?.replace("ROLE_", "");

  // Not logged in
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Role not allowed
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

/* ===================== LAYOUT ===================== */
function Layout({ children }) {
  return (
    <>
      <Navbar />
      <div className="pt-20 p-4">{children}</div>
    </>
  );
}

/* ===================== ROUTES ===================== */
function AppRoutes() {
  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/" element={<AuthPage />} />

      {/* PRIVATE */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                {/* ---- SHARED (USER, LIBRARIAN, ADMIN) ---- */}
                <Route path="/dashboard" element={<Home />} />
                <Route path="/books" element={<Books />} />
                <Route path="/digital-material" element={<DigitalMaterial />} />

                {/* ---- LIBRARIAN & ADMIN ---- */}
                <Route
                  path="/borrow"
                  element={
                    <ProtectedRoute allowedRoles={["LIBRARIAN", "ADMIN"]}>
                      <Borrow />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/return"
                  element={
                    <ProtectedRoute allowedRoles={["LIBRARIAN", "ADMIN"]}>
                      <ReturnBook />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/penality"
                  element={
                    <ProtectedRoute allowedRoles={["LIBRARIAN", "ADMIN"]}>
                      <Penality />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/reservation"
                  element={
                    <ProtectedRoute allowedRoles={["LIBRARIAN", "ADMIN"]}>
                      <Reservation />
                    </ProtectedRoute>
                  }
                />

                {/* ---- ADMIN ONLY ---- */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/customer"
                  element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                      <Customer />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/assign-role"
                  element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                      <AssignRole />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/books/add"
                  element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                      <AddBook />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/material"
                  element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                      <Material />
                    </ProtectedRoute>
                  }
                />

                {/* 404 */}
                <Route path="*" element={<div>404 Not Found</div>} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

/* ===================== APP ===================== */
export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
