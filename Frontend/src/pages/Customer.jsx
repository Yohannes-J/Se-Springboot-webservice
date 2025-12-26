import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Customer() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", role: "STUDENT" });

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
    if (!form.name || !form.email) {
      toast.error("Name and Email are required!");
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
        setForm({ name: "", email: "", role: "STUDENT" });
        fetchUsers();
      } else {
        const msg = await res.text();
        toast.error(msg || "Failed to add user!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!");
    }
  };

  // --- NEW REMOVE FUNCTIONALITY ---
  const removeUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name}? This action is for graduated or dismissed customers.`)) {
      return;
    }

    try {
      const res = await fetch(`https://localhost:8081/api/customers/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Customer removed from directory");
        fetchUsers(); // Refresh list
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

      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Customer Directory</h2>
          <p className="text-gray-500">Manage library patrons and staff records.</p>
        </div>
      </div>

      {/* QUICK ADD FORM */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap lg:flex-nowrap gap-4 items-end mb-8">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Full Name</label>
          <input
            placeholder="e.g. John Doe"
            className="w-full border-gray-200 border-2 p-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Email Address</label>
          <input
            type="email"
            placeholder="john@example.com"
            className="w-full border-gray-200 border-2 p-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div className="w-full lg:w-48">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Role</label>
          <select
            className="w-full border-gray-200 border-2 p-2.5 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="STUDENT">Student</option>
            <option value="TEACHER">Teacher</option>
            <option value="LIBRARIAN">Librarian</option>
          </select>
        </div>

        <button
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-100 h-[46px]"
          onClick={createUser}
        >
          Add User
        </button>
      </div>

      {/* USERS TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">ID</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Name</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Email</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Role</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-blue-50/30 transition-all group">
                <td className="px-6 py-4 text-sm font-mono text-gray-400">#{u.id}</td>
                <td className="px-6 py-4 font-semibold text-gray-700">{u.name}</td>
                <td className="px-6 py-4 text-gray-600">{u.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    u.role === 'LIBRARIAN' ? 'bg-purple-100 text-purple-600' :
                    u.role === 'TEACHER' ? 'bg-amber-100 text-amber-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => removeUser(u.id, u.name)}
                    className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title="Remove graduated or dismissed customer"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic">
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