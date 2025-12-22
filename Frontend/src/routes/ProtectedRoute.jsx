import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const userRole = localStorage.getItem("role"); // saved on login

  if (userRole !== "ADMIN") {
    return <Navigate to="/" replace />; // redirect non-admins to login
  }

  return children;
}
