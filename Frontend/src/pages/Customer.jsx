import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// --- LIBRARY IMPORTS ---
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const BASE_URL = "https://localhost:8081/api/customers";

export default function Customer() {
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [fetchAll, setFetchAll] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    role: "STUDENT",
  });

  // ================= FETCH =================
  const fetchUsers = async (page = 1) => {
    try {
      let url = fetchAll
        ? BASE_URL
        : `${BASE_URL}/list?page=${page - 1}&size=${pageSize}&sortBy=name&sortDir=asc`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch customers");

      const data = await res.json();

      if (fetchAll) {
        setUsers(data);
        setCurrentPage(1);
        setTotalPages(1);
      } else {
        setUsers(data.data || []);
        setCurrentPage((data.currentPage ?? 0) + 1);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error(error);
      toast.error("Could not load customers list");
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [pageSize, fetchAll]);

  // ================= CREATE =================
  const createUser = async () => {
    if (!form.name || !form.email || !form.phoneNumber) {
      toast.error("Name, Email, and Phone Number are required!");
      return;
    }

    try {
      // Logic: Ensure phoneNumber includes "+" for the backend
      const payload = { 
        ...form, 
        phoneNumber: form.phoneNumber.startsWith('+') ? form.phoneNumber : `+${form.phoneNumber}` 
      };

      const res = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Customer added successfully!");
        resetForm();
        fetchUsers(currentPage);
      } else {
        toast.error("Failed to add customer");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!");
    }
  };

  // ================= EDIT =================
  const editUser = (user) => {
    setEditingId(user.id);
    setForm({
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
    });
  };

  // ================= UPDATE =================
  const updateUser = async () => {
    try {
      const payload = { 
        ...form, 
        phoneNumber: form.phoneNumber.startsWith('+') ? form.phoneNumber : `+${form.phoneNumber}` 
      };

      const res = await fetch(`${BASE_URL}/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();
      toast.success("Customer updated successfully!");
      resetForm();
      fetchUsers(currentPage);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update customer");
    }
  };

  // ================= DELETE =================
  const removeUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name}?`)) return;

    try {
      const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Customer removed from directory");
        fetchUsers(currentPage);
      } else {
        toast.error("Failed to remove customer");
      }
    } catch (error) {
      console.error(error);
      toast.error("Connection error");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ name: "", email: "", phoneNumber: "", role: "STUDENT" });
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    fetchUsers(page);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Customer Directory</h2>
          <p className="text-gray-500">Manage library patrons and staff records.</p>
        </div>
        <button
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-all"
          onClick={() => setFetchAll(!fetchAll)}
        >
          {fetchAll ? "Paginated View" : "View All"}
        </button>
      </div>

      {/* FORM */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap lg:flex-nowrap gap-4 items-end mb-8">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Full Name</label>
          <input
            placeholder="Enter full name"
            className="w-full border-gray-200 border-2 p-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Email</label>
          <input
            type="email"
            placeholder="Enter email"
            className="w-full border-gray-200 border-2 p-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        {/* --- REPLACED PHONE INPUT --- */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Phone Number</label>
          <PhoneInput
            country={"et"} // Default to Ethiopia
            value={form.phoneNumber}
            onChange={(phone) => setForm({ ...form, phoneNumber: phone })}
            inputStyle={{
              width: "100%",
              height: "45px",
              borderRadius: "12px",
              border: "2px solid #e5e7eb",
              fontSize: "14px",
            }}
            buttonStyle={{
              borderRadius: "12px 0 0 12px",
              border: "2px solid #e5e7eb",
              borderRight: "none",
              backgroundColor: "white",
            }}
            containerClass="focus-within:ring-2 focus-within:ring-blue-500 rounded-xl"
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
          className="bg-blue-500 text-white px-3 py-1 rounded-xl font-bold hover:bg-blue-400 active:scale-95 transition-all shadow-lg h-[45px]"
          onClick={editingId ? updateUser : createUser}
        >
          {editingId ? "Update" : "Add User"}
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">ID</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Name</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Email</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Phone</th>
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
                <td className="px-6 py-4 text-gray-600">{u.phoneNumber}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    u.role === "LIBRARIAN" ? "bg-purple-100 text-purple-600" :
                    u.role === "TEACHER" ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => editUser(u)} className="p-2 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                  </button>
                  <button onClick={() => removeUser(u.id, u.name)} className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7 m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!fetchAll && (
          <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
            <div className="flex gap-2">
              <button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)} className="px-3 py-1 text-xs font-bold border rounded disabled:opacity-20">Prev</button>
              <button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)} className="px-3 py-1 text-xs font-bold bg-blue-500 text-white rounded disabled:opacity-20">Next</button>
            </div>
            <span className="text-xs font-bold text-gray-400">Page {currentPage} of {totalPages}</span>
            <select value={pageSize} onChange={(e) => setPageSize(+e.target.value)} className="border rounded px-2 py-1 text-xs">
              {[5, 10, 20, 50].map((n) => <option key={n} value={n}>{n} / page</option>)}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}