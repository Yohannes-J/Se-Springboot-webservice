import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", role: "MEMBER" });

  
  const fetchUsers = async () => {
    const res = await fetch("https://localhost:8081/api/users");
    const data = await res.json();
    setUsers(data);
  };

  const createUser = async () => {
    if (!form.name || !form.email) {
      toast.error("Name and Email are required!");
      return;
    }

    try {
      const res = await fetch("https://localhost:8081/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success("User added successfully! 🎉");
        setForm({ name: "", email: "", role: "MEMBER" });
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

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} />

      <h2 className="text-xl font-bold mb-4">Users</h2>

      
      <div className="mb-4 flex gap-2">
        <input
          placeholder="Name"
          className="border p-2 rounded"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          placeholder="Email"
          className="border p-2 rounded"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <select
          className="border p-2 rounded"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="MEMBER">Member</option>
          <option value="TEACHER">Teacher</option>
          <option value="LIBRARIAN">Librarian</option>
        </select>

        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          onClick={createUser}
        >
          Add
        </button>
      </div>

      
      <table className="min-w-full border border-gray-300 rounded">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Role</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="hover:bg-gray-50">
              <td className="border px-4 py-2">{u.id}</td>
              <td className="border px-4 py-2">{u.name}</td>
              <td className="border px-4 py-2">{u.email}</td>
              <td className="border px-4 py-2">{u.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
