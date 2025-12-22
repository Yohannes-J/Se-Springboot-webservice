import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center py-4 px-6">
        <h1 className="text-3xl font-bold">Library Management System</h1>
        <nav className="space-x-4">
          <Link to="/dashboard" className="hover:underline">Home</Link>
          <Link to="/books" className="hover:underline">Books</Link>
          <Link to="/users" className="hover:underline">Users</Link>
          <Link to="/borrow" className="hover:underline">Borrow</Link>
          <Link to="/return" className="hover:underline">Return</Link>
          <Link to="/assign-role" className="hover:underline">Assign Role</Link>
          <Link to="/admin" className="hover:underline">Admin</Link>
          <Link to="/penality" className="hover:underline">Penality</Link>

          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-white"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
