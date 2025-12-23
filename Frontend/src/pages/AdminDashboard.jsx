import { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Customer from "./Customer";

const BASE_URL = "https://localhost:8081";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    books: 0,
    borrowed: 0,
    returned: 0,
    customers: 0,
  });
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/admin/dashboard`, { headers });
      setStats(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="p-6">
      <ToastContainer />
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <button
        onClick={loadStats}
        disabled={loading}
        className={`mb-6 px-4 py-2 rounded text-white ${
          loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Loading..." : "Refresh Stats"}
      </button>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={stats.users} color="bg-blue-500" />
        <StatCard title="Total Books" value={stats.books} color="bg-green-500" />
        <StatCard title="Borrowed Books" value={stats.borrowed} color="bg-yellow-500" />
        <StatCard title="Returned Books" value={stats.returned} color="bg-purple-500" />
        <StatCard title="Total Customers" value={stats.customers} color="bg-red-500" />
      </div>
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div className={`p-6 rounded-xl shadow text-white ${color}`}>
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}
