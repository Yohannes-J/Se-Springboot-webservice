
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FiMenu,
  FiX,
  FiLogOut,
  FiChevronRight,
  FiHome,
  FiBook,
  FiUsers,
  FiClipboard,
  FiRotateCw,
  FiShield,
  FiUserCheck,
  FiAlertCircle, 
} from "react-icons/fi";
import logo from "../assets/logo.png";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation(); // Helps highlight the active page
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
    setOpen(false);
  };

  
  const menuItems = [
    { name: "Home", path: "/dashboard", icon: <FiHome /> },
    { name: "Books", path: "/books", icon: <FiBook /> },
    { name: "Customers", path: "/customer", icon: <FiUsers /> },
    { name: "Borrow", path: "/borrow", icon: <FiClipboard /> },
    { name: "Return", path: "/return", icon: <FiRotateCw /> },
    { name: "Assign Role", path: "/assign-role", icon: <FiUserCheck /> },
    { name: "Admin", path: "/admin", icon: <FiShield /> },
    { name: "Penality", path: "/penality", icon: <FiAlertCircle /> }, // Modern icon
  ];

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
  }, [open]);

  return (
    <header className="max-h-[calc(50vh-4rem)] bg-slate-900 text-white shadow-xl fixed w-full z-50">
      <div className="container mx-auto flex justify-between items-center h-18 px-6">
        {/* Logo Section */}
        <div className="flex items-center space-x-3">
          <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
          <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
            WDU <span className="hidden sm:inline">Digital Library</span>
          </h1>
        </div>

       
        <button
          className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-2xl focus:outline-none"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <FiX /> : <FiMenu />}
        </button>
      </div>

   
      {open && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setOpen(false)}
        />
      )}

      
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-slate-900 text-slate-100 z-50 shadow-2xl transform 
        ${
          open ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-out`}
      >
        <div className="flex flex-col h-full">
        
          <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
            <img src={logo} alt="Logo" className="w-8 h-8" />
            <span className="font-bold text-lg">Library Menu</span>
          </div>



          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all group
                    ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                        : "hover:bg-slate-800 hover:text-blue-400"
                    }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.name}</span>
                  </div>
                  <FiChevronRight
                    className={`transition-transform ${
                      isActive ? "rotate-90" : "group-hover:translate-x-1"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200"
            >
              <FiLogOut />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}