import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* ✅ Email validation helper */
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/* ✅ Phone validation helper */
const isValidPhone = (phone) => {
  return /^[0-9+]{9,15}$/.test(phone);
};

export default function Customer() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    role: "STUDENT",
  });

  const fetchUsers = async () => {
    try {
      const res = await fetch("https://localhost:8081/api/customers");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      toast.error("Could not load users list");
    }
  };

  const createUser = async () => {
    if (!form.name || !form.email || !form.phoneNumber) {
      toast.error("Name, Email and Phone Number are required!");
      return;
    }

    if (!isValidEmail(form.email)) {
      toast.error("Please enter a valid email address!");
      return;
    }

    if (!isValidPhone(form.phoneNumber)) {
      toast.error("Please enter a valid phone number!");
      return;
    }

    try {
      const res = await fetch("https://localhost:8081/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success("User added successfully!");
        setForm({
          name: "",
          email: "",
          phoneNumber: "",
          role: "STUDENT",
        });
        fetchUsers();
      } else {
        const msg = await res.text();
        toast.error(msg || "Email or phone already exists");
      }
    } catch (error) {
      toast.error("Something went wrong!");
    }
  };

  const removeUser = async (id, name) => {
    if (
      !window.confirm(
        `Are you sure you want to remove ${name}? This action is for graduated or dismissed customers.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`https://localhost:8081/api/customers/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Customer removed from directory");
        fetchUsers();
      } else {
        toast.error("Failed to remove customer");
      }
    } catch (error) {
      toast.error("Connection error");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      {/* QUICK ADD FORM */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap lg:flex-nowrap gap-4 items-end mb-8">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">
            Full Name
          </label>
          <input
            className="w-full border-gray-200 border-2 p-2.5 rounded-xl"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">
            Email Address
          </label>
          <input
            type="email"
            className="w-full border-gray-200 border-2 p-2.5 rounded-xl"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">
            Phone Number
          </label>
          <input
            placeholder="+2519XXXXXXX"
            className="w-full border-gray-200 border-2 p-2.5 rounded-xl"
            value={form.phoneNumber}
            onChange={(e) =>
              setForm({ ...form, phoneNumber: e.target.value })
            }
          />
        </div>

        <div className="w-full lg:w-48">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">
            Role
          </label>
          <select
            className="w-full border-gray-200 border-2 p-2.5 rounded-xl"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="STUDENT">Student</option>
            <option value="TEACHER">Teacher</option>
            <option value="LIBRARIAN">Librarian</option>
          </select>
        </div>

        <button
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold"
          onClick={createUser}
        >
          Add User
        </button>
      </div>

      {/* USERS TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Phone</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-6 py-4">#{u.id}</td>
                <td className="px-6 py-4">{u.name}</td>
                <td className="px-6 py-4">{u.email}</td>
                <td className="px-6 py-4">{u.phoneNumber}</td>
                <td className="px-6 py-4">{u.role}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => removeUser(u.id, u.name)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Delete customer"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}

            {users.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-10 text-gray-400">
                  No customers registered yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
