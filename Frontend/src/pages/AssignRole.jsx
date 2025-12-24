import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BASE_URL = "https://localhost:8081/api";
const ROLES = ["USER", "ADMIN", "LIBRARIAN"];

export default function AssignRole() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const token = localStorage.getItem("token");

  const headers = { Authorization: `Bearer ${token}` };

  const loadUsers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/user/getAllUsers`, { headers });
      setUsers(res.data);
    } catch {
      toast.error("Failed to load users");
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const normalizeRole = (role) => role?.replace("ROLE_", "") || "USER";

  const changeRole = async (userId, role) => {
    try {
      await axios.put(
        `${BASE_URL}/user/assign-role`,
        { userId, role },
        { headers }
      );
      toast.success(`Access updated to ${role}`);
      loadUsers();
    } catch {
      toast.error("Permission denied or server error");
    }
  };

  // Filter Logic
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch = u.username.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === "ALL" || normalizeRole(u.role) === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  // Statistics
  const stats = {
    total: users.length,
    admins: users.filter(u => normalizeRole(u.role) === "ADMIN").length,
    librarians: users.filter(u => normalizeRole(u.role) === "LIBRARIAN").length
  };

  const getRoleStyle = (role) => {
    switch (role) {
      case "ADMIN": return "bg-rose-100 text-rose-700 border-rose-200";
      case "LIBRARIAN": return "bg-indigo-100 text-indigo-700 border-indigo-200";
      default: return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 font-sans antialiased">
      <ToastContainer position="bottom-right" theme="colored" />
      
      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Access <span className="text-indigo-600">Control</span></h2>
          <p className="text-slate-500 font-medium mt-1">Configure system permissions and administrative roles.</p>
        </div>
        
        {/* Quick Stats Summary */}
        <div className="flex gap-3">
          <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Total Users</p>
            <p className="text-lg font-black text-slate-800">{stats.total}</p>
          </div>
          <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm text-center border-l-4 border-l-rose-500">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Admins</p>
            <p className="text-lg font-black text-slate-800">{stats.admins}</p>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <input 
            type="text"
            placeholder="Search by username..."
            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-11 text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex gap-2">
          <select 
            className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-600 outline-none cursor-pointer hover:bg-slate-100 transition-all"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">All Roles</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          <button 
            onClick={() => {setSearchQuery(""); setRoleFilter("ALL");}}
            className="bg-slate-800 text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-700 transition-all"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white shadow-xl rounded-3xl overflow-hidden border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-50/80">
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Identity</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Status</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Modify Permission</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => {
                const currentRole = normalizeRole(u.role);

                return (
                  <tr key={u.id} className="group transition-all duration-300 hover:bg-indigo-50/30 hover:shadow-[inset_4px_0_0_0_#4f46e5] hover:translate-x-1">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm transition-transform group-hover:scale-110 ${
                          currentRole === 'ADMIN' ? 'bg-rose-500 text-white' : 
                          currentRole === 'LIBRARIAN' ? 'bg-indigo-600 text-white' : 
                          'bg-slate-200 text-slate-600'
                        }`}>
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-extrabold text-slate-800 text-base leading-none mb-1 group-hover:text-indigo-700 transition-colors">
                            {u.username}
                          </span>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">User ID: #{u.id}</span>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-widest ${getRoleStyle(currentRole)}`}>
                        {currentRole}
                      </span>
                    </td>

                    <td className="px-8 py-6 text-right">
                      <div className="inline-flex items-center bg-slate-100 p-1.5 rounded-xl border border-slate-200 group-hover:bg-white transition-colors">
                        <select
                          value={currentRole}
                          onChange={(e) => changeRole(u.id, e.target.value)}
                          className="bg-transparent border-none text-slate-700 text-xs font-black uppercase tracking-widest p-2 outline-none cursor-pointer"
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>
                              Set as {r}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                );
              })}
              
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="3" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="bg-slate-100 p-4 rounded-full mb-4">
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No matching users found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}