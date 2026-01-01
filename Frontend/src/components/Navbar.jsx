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
  FiBookOpen,
} from "react-icons/fi";
import logo from "../assets/logo.png";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  /* ===================== ROLE HANDLING ===================== */
  const rawRole = localStorage.getItem("role") || "USER";
  const userRole = rawRole.replace("ROLE_", "").toUpperCase();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
    setOpen(false);
  };

  /* ===================== MENU CONFIG ===================== */
  const menuItems = [
    // Everyone
    {
      name: "Home",
      path: "/dashboard",
      icon: <FiHome />,
      roles: ["USER", "LIBRARIAN", "ADMIN"],
    },
    {
      name: "Books",
      path: "/books",
      icon: <FiBook />,
      roles: ["USER", "LIBRARIAN", "ADMIN"],
    },
    {
      name: "Digital Materials",
      path: "/digital-material",
      icon: <FiBook />,
      roles: ["USER", "LIBRARIAN", "ADMIN"],
    },

    /* ✅ RESERVATION ADDED HERE */
    {
      name: "Reservation",
      path: "/reservation",
      icon: <FiBookOpen />,
      roles: ["LIBRARIAN", "ADMIN"],
    },

    // Librarian + Admin
    {
      name: "Borrow",
      path: "/borrow",
      icon: <FiClipboard />,
      roles: ["LIBRARIAN", "ADMIN"],
    },
    {
      name: "Return",
      path: "/return",
      icon: <FiRotateCw />,
      roles: ["LIBRARIAN", "ADMIN"],
    },
    {
      name: "Penality",
      path: "/penality",
      icon: <FiAlertCircle />,
      roles: ["LIBRARIAN", "ADMIN"],
    },

    // Admin only
    {
      name: "Customers",
      path: "/customer",
      icon: <FiUsers />,
      roles: ["ADMIN"],
    },
    {
      name: "Assign Role",
      path: "/assign-role",
      icon: <FiUserCheck />,
      roles: ["ADMIN"],
    },
    {
      name: "Materials",
      path: "/material",
      icon: <FiBook />,
      roles: ["ADMIN"],
    },
    {
      name: "Admin",
      path: "/admin",
      icon: <FiShield />,
      roles: ["ADMIN"],
    },
  ];

  const filteredMenu = menuItems.filter((item) =>
    item.roles.includes(userRole)
  );

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
  }, [open]);

  return (
    <header className="bg-slate-900 text-white shadow-xl fixed w-full z-50">
      {/* ===================== TOP BAR ===================== */}
      <div className="container mx-auto flex justify-between items-center h-18 px-6">
        <div className="flex items-center space-x-3">
          <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
          <div className="flex flex-col">
            <h1 className="text-xl font-extrabold tracking-tight bg-linear-to-r from-white to-blue-400 bg-clip-text text-transparent">
              WDU <span className="hidden sm:inline">Library</span>
            </h1>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400">
              {userRole} ACCESS
            </span>
          </div>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded-lg hover:bg-slate-800 text-2xl"
        >
          {open ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* ===================== BACKDROP ===================== */}
      {open && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ===================== SIDEBAR ===================== */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-slate-900 z-50 shadow-2xl transform 
        ${open ? "translate-x-0" : "-translate-x-full"}
        transition-transform duration-300`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
            <img src={logo} alt="Logo" className="w-8 h-8" />
            <span className="font-bold text-lg">Library Menu</span>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {filteredMenu.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all group
                    ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg"
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
              className="w-full flex items-center justify-center space-x-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-4 py-3 rounded-xl font-semibold"
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
