import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, roles }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) return <Navigate to="/" />; // Not logged in
  if (roles && !roles.includes(role)) return <Navigate to="/dashboard" />; // No permission

  return children;
}
