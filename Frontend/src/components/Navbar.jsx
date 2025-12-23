import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import logo from "../assets/logo.png";

export default function Navbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/");
    setOpen(false);
  };

  const menuItems = [
    { name: "Home", path: "/dashboard" },
    { name: "Books", path: "/books" },
    { name: "Customers", path: "/customer" },
    { name: "Borrow", path: "/borrow" },
    { name: "Return", path: "/return" },
    { name: "Assign Role", path: "/assign-role" },
    { name: "Admin", path: "/admin" },
    { name: "Penality", path: "/penality" },
  ];

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
  }, [open]);

  return (
    <header className="bg-blue-900 text-white shadow-md fixed w-full z-50">
      <div className="container mx-auto flex justify-between items-center py-0 px-6">
        {/* Logo + Text */}
        <div className="flex items-center space-x-2">
          <img src={logo} alt="Logo" className="w-10 h-10" />
          <h1 className="text-2xl font-bold">WDU Digital Library</h1>
        </div>

        {/* Hamburger Menu Button */}
        <button
          className="text-3xl focus:outline-none"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile Slide-in Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-blue-700 text-white z-50 transform 
        ${open ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out`}
      >
        <h2 className="text-xl font-bold p-4 border-b border-blue-500">Menu</h2>
        <nav className="flex flex-col p-4 space-y-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
              className="hover:underline"
            >
              {item.name}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="text-left bg-red-500 hover:bg-red-600 px-4 py-2 rounded mt-4 transition-colors duration-200"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}