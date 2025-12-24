import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Customer() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", role: "STUDENT" });
  const [editId, setEditId] = useState(null);

  // --- Search & Pagination State ---
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const authHeaders = (json = true) => {
    const token = localStorage.getItem("token");
    if (!token) return {};
    const headers = { Authorization: `Bearer ${token}` };
    if (json) headers["Content-Type"] = "application/json";
    return headers;
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("https://localhost:8081/api/customers", {
        headers: authHeaders(false)
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      toast.error("Session expired or unauthorized.");
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email) {
      toast.error("Name and Email are required!");
      return;
    }

    const url = editId 
      ? `https://localhost:8081/api/customers/${editId}` 
      : "https://localhost:8081/api/customers";
    
    const method = editId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method: method,
        headers: authHeaders(true),
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        toast.success(editId ? "User updated!" : "User added!");
        setForm({ name: "", email: "", role: "STUDENT" });
        setEditId(null);
        fetchUsers();
      } else {
        // Smart error message from backend
        const errorMsg = data.errors ? data.errors[0].defaultMessage : data.message;
        toast.error(errorMsg || "Permission denied or invalid data");
      }
    } catch (error) {
      toast.error("Something went wrong!");
    }
  };

  const startEdit = (user) => {
    setEditId(user.id);
    setForm({ name: user.name, email: user.email, role: user.role });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const removeUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name}?`)) return;
    try {
      const res = await fetch(`https://localhost:8081/api/customers/${id}`, {
        method: "DELETE",
        headers: authHeaders(false),
      });
      if (res.ok) {
        toast.success("Customer removed");
        fetchUsers();
      } else {
        toast.error("Failed to remove. Check active loans or permissions.");
      }
    } catch (error) {
      toast.error("Connection error");
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // --- Logic for Search and Pagination ---
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">{editId ? "Edit Customer" : "Customer Directory"}</h2>
        <p className="text-gray-500">{editId ? `Updating profile for #${editId}` : "Add and manage library patrons."}</p>
      </div>

      {/* FORM SECTION */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap lg:flex-nowrap gap-4 items-end mb-8">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Full Name</label>
          <input
            className="w-full border-gray-200 border-2 p-2.5 rounded-xl outline-none focus:border-blue-500 transition-all"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Email</label>
          <input
            type="email"
            className="w-full border-gray-200 border-2 p-2.5 rounded-xl outline-none focus:border-blue-500 transition-all"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div className="w-full lg:w-48">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Role</label>
          <select
            className="w-full border-gray-200 border-2 p-2.5 rounded-xl bg-white outline-none focus:border-blue-500 transition-all"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="STUDENT">Student</option>
            <option value="TEACHER">Teacher</option>
            <option value="LIBRARIAN">Librarian</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            className={`${editId ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg`}
            onClick={handleSubmit}
          >
            {editId ? "Update User" : "Add User"}
          </button>
          {editId && (
            <button 
              className="bg-gray-200 text-gray-600 px-4 py-3 rounded-xl font-bold hover:bg-gray-300"
              onClick={() => { setEditId(null); setForm({name: "", email: "", role: "STUDENT"}); }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="mb-4 relative">
        <input 
          type="text"
          placeholder="Search by name or email..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-gray-100 rounded-xl outline-none focus:border-blue-400 transition-all shadow-sm"
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
        />
        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">User</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Role</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {currentItems.length > 0 ? currentItems.map((u) => (
              <tr key={u.id} className="hover:bg-blue-50/30 group">
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-700">{u.name}</div>
                  <div className="text-xs text-gray-400">{u.email}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    u.role === 'LIBRARIAN' ? 'bg-purple-100 text-purple-600' :
                    u.role === 'TEACHER' ? 'bg-amber-100 text-amber-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>{u.role}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => startEdit(u)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button onClick={() => removeUser(u.id, u.name)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="3" className="px-6 py-10 text-center text-gray-400">No users found matchng your search.</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* PAGINATION CONTROLS */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="text-sm font-bold text-blue-600 disabled:text-gray-300 flex items-center gap-1 transition-colors"
            >
              ← Previous
            </button>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="text-sm font-bold text-blue-600 disabled:text-gray-300 flex items-center gap-1 transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}