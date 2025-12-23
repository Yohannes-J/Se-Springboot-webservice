import { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BASE_URL = "https://localhost:8081/api";

const ROLES = ["USER", "ADMIN", "LIBRARIAN"];

export default function AssignRole() {
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const loadUsers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/user/getAllUsers`, { headers });
      setUsers(res.data);
    } catch {
      toast.error("Failed to load users");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const normalizeRole = (role) =>
    role?.replace("ROLE_", "") || "USER";

  const changeRole = async (userId, role) => {
    try {
      await axios.put(
        `${BASE_URL}/user/assign-role`,
        { userId, role }, // USER | ADMIN | LIBRARIAN
        { headers }
      );
      toast.success("Role updated");
      loadUsers();
    } catch {
      toast.error("Failed to update role");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-xl shadow">
      <ToastContainer />

      <h2 className="text-2xl font-bold mb-4">Assign User Roles</h2>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Username</th>
            <th className="border p-2">Current Role</th>
            <th className="border p-2">Change Role</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => {
            const currentRole = normalizeRole(u.role);

            return (
              <tr key={u.id}>
                <td className="border p-2">{u.username}</td>
                <td className="border p-2 font-medium">
                  {currentRole}
                </td>
                <td className="border p-2">
                  <select
                    value={currentRole}
                    onChange={(e) =>
                      changeRole(u.id, e.target.value)
                    }
                    className="border p-1 rounded"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
