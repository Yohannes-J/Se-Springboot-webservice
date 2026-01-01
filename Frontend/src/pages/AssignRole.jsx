import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;
const ROLES = ["USER", "ADMIN", "LIBRARIAN"];

export default function AssignRole() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // Load all users
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

  // Assign a new role
  const changeRole = async (userId, role) => {
    try {
      await axios.put(`${BASE_URL}/user/assign-role`, { userId, role }, { headers });
      toast.success(`Role updated to ${role}`);
      loadUsers();
    } catch {
      toast.error("Permission denied or server error");
    }
  };

  // Revoke a role
  const revokeRole = async (userId, role) => {
    try {
      await axios.put(`${BASE_URL}/user/revoke-role`, { userId, role }, { headers });
      toast.success(`Role ${role} revoked`);
      loadUsers();
    } catch {
      toast.error("Failed to revoke role");
    }
  };

  // Toggle activation
  const toggleActivation = async (userId, isActive) => {
    try {
      await axios.put(`${BASE_URL}/user/toggle-activation/${userId}`, {}, { headers });
      if (isActive) {
        toast.error("User deactivated"); // Red for deactivation
      } else {
        toast.success("User activated"); // Green for activation
      }
      loadUsers();
    } catch {
      toast.error("Failed to update user status");
    }
  };

  // Reset password
  const resetPassword = async (userId) => {
    const oldPassword = prompt("Enter current password:");
    if (!oldPassword) return;

    const newPassword = prompt("Enter new password:");
    if (!newPassword) return;

    try {
      await axios.put(`${BASE_URL}/user/reset-password/${userId}`, 
        { oldPassword, newPassword }, 
        { headers }
      );
      toast.success("Password reset successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password");
    }
  };

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = u.username.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === "ALL" || normalizeRole(u.role) === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const stats = {
    total: users.length,
    admins: users.filter(u => normalizeRole(u.role) === "ADMIN").length,
    librarians: users.filter(u => normalizeRole(u.role) === "LIBRARIAN").length
  };

  const getRoleStyle = (role) => {
    switch (role) {
      case "ADMIN": return "bg-rose-50 text-rose-700 border-rose-200";
      case "LIBRARIAN": return "bg-indigo-50 text-indigo-700 border-indigo-200";
      default: return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 font-sans antialiased text-slate-900">
      <ToastContainer position="bottom-right" theme="colored" />

      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight">
            Access <span className="text-indigo-600">Control</span>
          </h2>
          <p className="text-slate-500 mt-2 text-lg">Manage user permissions, activation, and roles.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white border border-slate-200 px-6 py-3 rounded-2xl shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Users</p>
            <p className="text-2xl font-black">{stats.total}</p>
          </div>
          <div className="bg-white border border-slate-200 px-6 py-3 rounded-2xl shadow-sm border-l-4 border-l-rose-500">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Admins</p>
            <p className="text-2xl font-black">{stats.admins}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 mb-8">
        <input
          type="text"
          placeholder="Search users..."
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="ALL">All Roles</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <button
          onClick={() => { setSearchQuery(""); setRoleFilter("ALL"); }}
          className="bg-slate-900 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow-sm rounded-3xl overflow-hidden border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">User Identity</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Role</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map(u => {
                const currentRole = normalizeRole(u.role);
                const isActive = u.active;
                return (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6 flex items-center gap-4">
                      <div className={`h-11 w-11 rounded-xl flex items-center justify-center font-bold text-base ${
                        currentRole === 'ADMIN' ? 'bg-rose-600 text-white' : 
                        currentRole === 'LIBRARIAN' ? 'bg-indigo-600 text-white' : 
                        'bg-slate-200 text-slate-600'
                      }`}>{u.username.charAt(0).toUpperCase()}</div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-base">{u.username}</span>
                        <span className="text-xs text-slate-400">ID: #{u.id}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-lg text-[11px] font-bold border uppercase tracking-wider ${getRoleStyle(currentRole)}`}>
                        {currentRole}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right flex gap-2 justify-end items-center flex-wrap">
                      {/* Role dropdown */}
                      <select
                        value={currentRole}
                        onChange={(e) => changeRole(u.id, e.target.value)}
                        className="bg-slate-50 border-none text-slate-700 text-[11px] font-bold uppercase tracking-wider p-2 outline-none cursor-pointer rounded-lg"
                      >
                        {ROLES.map(r => <option key={r} value={r}>Assign {r}</option>)}
                      </select>

                      {/* Toggle activation */}
                      <button
                        onClick={() => toggleActivation(u.id, isActive)}
                        className={`px-2 py-1 rounded-lg text-xs ${isActive ? "bg-red-600 text-white" : "bg-green-600 text-white"}`}
                      >
                        {isActive ? "Deactivate" : "Activate"}
                      </button>

                      {/* Reset password */}
                      <button
                        onClick={() => resetPassword(u.id)}
                        className="bg-yellow-500 text-white px-2 py-1 rounded-lg text-xs"
                      >
                        Reset PW
                      </button>

                      {/* Revoke role */}
                      <button
                        onClick={() => revokeRole(u.id, currentRole)}
                        className="bg-gray-500 text-white px-2 py-1 rounded-lg text-xs"
                      >
                        Revoke Role
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="3" className="px-6 py-24 text-center text-slate-400 font-bold">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
