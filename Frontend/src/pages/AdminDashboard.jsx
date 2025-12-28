import { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Chart.js imports
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

import { Pie, Bar } from "react-chartjs-2";

// Register chart components
ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

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

  // ===================== CHART DATA =====================
  const pieData = {
    labels: ["Borrowed", "Returned"],
    datasets: [
      {
        data: [stats.borrowed, stats.returned],
        backgroundColor: ["#f59e0b", "#8b5cf6"],
        borderWidth: 1,
      },
    ],
  };

  const barData = {
    labels: ["Users", "Books", "Customers"],
    datasets: [
      {
        label: "System Overview",
        data: [stats.users, stats.books, stats.customers],
        backgroundColor: ["#3b82f6", "#10b981", "#f43f5e"],
      },
    ],
  };

  return (
    <div className="h-screen bg-gray-50 p-5">
      <ToastContainer position="top-right" theme="colored" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900">
              Admin <span className="text-indigo-600">Dashboard</span>
            </h1>
            <p className="text-gray-500 mt-1">
              Monitor your system library performance.
            </p>
          </div>

          <button
            onClick={loadStats}
            disabled={loading}
            className={`px-6 py-2.5 rounded-lg font-semibold transition-all shadow-sm ${
              loading
                ? "bg-gray-300 cursor-not-allowed text-gray-600"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
          >
            {loading ? "Syncing..." : "Refresh Stats"}
          </button>
        </header>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard
            title="Total Users"
            value={stats.users}
            color="from-blue-500 to-blue-600"
          />
          <StatCard
            title="Total Books"
            value={stats.books}
            color="from-emerald-500 to-emerald-600"
          />
          <StatCard
            title="Borrowed"
            value={stats.borrowed}
            color="from-amber-500 to-amber-600"
          />
          <StatCard
            title="Returned"
            value={stats.returned}
            color="from-purple-500 to-purple-600"
          />
          <StatCard
            title="Customers"
            value={stats.customers}
            color="from-rose-500 to-rose-600"
          />
        </div>

        {/* Charts */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pie Chart (SMALLER) */}
          <div className="bg-white p-10 rounded-2xl shadow-lg h-64">
            <h2 className="text-lg font-bold text-gray-800 mb-2">
              Borrowed vs Returned
            </h2>
            <Pie
              data={pieData}
              options={{
                maintainAspectRatio: false,
              }}
            />
          </div>

          {/* Bar Chart (SMALLER) */}
          <div className="bg-white p-10 rounded-2xl shadow-lg h-60">
            <h2 className="text-lg font-bold text-gray-800 mb-2">
              System Statistics
            </h2>
            <Bar
              data={barData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: true },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ===================== STAT CARD =====================
function StatCard({ title, value, color }) {
  return (
    <div
      className={`relative overflow-hidden p-4 rounded-2xl shadow-lg bg-linear-to-br ${color} text-white transition-transform hover:scale-105`}
    >
      <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-white opacity-10" />
      <h3 className="text-sm uppercase tracking-wider opacity-80">{title}</h3>
      <p className="text-4xl font-bold mt-3">{value.toLocaleString()}</p>
    </div>
  );
}
