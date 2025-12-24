import { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Customer from "./Customer"; // Included as per original code

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
    <div className="min-h-screen bg-gray-50 p-8">
      <ToastContainer position="top-right" theme="colored" />
      
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-gray-500 mt-1">Monitor your system library performance.</p>
          </div>

          <button
            onClick={loadStats}
            disabled={loading}
            className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 shadow-sm ${
              loading 
                ? "bg-gray-300 cursor-not-allowed text-gray-600" 
                : "bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95"
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Syncing...
              </span>
            ) : (
              "Refresh Stats"
            )}
          </button>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard title="Total Users" value={stats.users} color="from-blue-500 to-blue-600" />
          <StatCard title="Total Books" value={stats.books} color="from-emerald-500 to-emerald-600" />
          <StatCard title="Borrowed" value={stats.borrowed} color="from-amber-500 to-amber-600" />
          <StatCard title="Returned" value={stats.returned} color="from-purple-500 to-purple-600" />
          <StatCard title="Customers" value={stats.customers} color="from-rose-500 to-rose-600" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div className={`relative overflow-hidden p-6 rounded-2xl shadow-lg bg-gradient-to-br ${color} text-white transform transition-transform hover:scale-105`}>
      {/* Decorative background circle */}
      <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-white opacity-10" />
      
      <h3 className="text-sm font-medium uppercase tracking-wider opacity-80">
        {title}
      </h3>
      <p className="text-4xl font-bold mt-3">
        {value.toLocaleString()}
      </p>
    </div>
  );
}