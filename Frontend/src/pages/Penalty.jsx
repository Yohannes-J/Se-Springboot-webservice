import React, { useEffect, useState } from "react";
import axios from "axios";

const Penality = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role"); 
  const headers = { Authorization: `Bearer ${token}` };

  const LATE_FINE_PER_DAY = 5;
  const BROKEN_PAGE_FINE = 2;
  const LOST_BOOK_FINE = 50;

  // Fetch borrow records
  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      try {
        const res = await axios.get("https://localhost:8081/api/borrow/all", { headers });
        setRecords(res.data);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch borrow records");
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  // Calculate penalties
  const calculatePenalty = (r) => {
    const today = new Date();
    const dueDate = new Date(r.dueDate);
    const overdue = dueDate < today;

    const latePenalty = overdue ? Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24)) * LATE_FINE_PER_DAY : 0;
    const brokenPenalty = (r.brokenPages || 0) * BROKEN_PAGE_FINE;
    const lostPenalty = r.lost ? LOST_BOOK_FINE : 0;

    return {
      latePenalty,
      brokenPenalty,
      lostPenalty,
      total: latePenalty + brokenPenalty + lostPenalty,
      overdue
    };
  };

  // Update borrow record fields
  const handleFieldChange = async (id, field, value) => {
    try {
      setRecords(records.map(r => r.id === id ? { ...r, [field]: value } : r));

      // Send update to backend
      await axios.put(`https://localhost:8081/api/borrow/update/${id}`, { [field]: value }, { headers });
    } catch (err) {
      console.error(err);
      alert("Failed to update record");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Borrowed Books & Penalties</h2>

      {loading ? <p>Loading...</p> :
      <table className="min-w-full bg-white border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">Customer</th>
            <th className="border px-4 py-2">Book</th>
            <th className="border px-4 py-2">Borrow Date</th>
            <th className="border px-4 py-2">Due Date</th>
            <th className="border px-4 py-2">Broken Pages</th>
            <th className="border px-4 py-2">Lost</th>
            <th className="border px-4 py-2">Overdue</th>
            <th className="border px-4 py-2">Late ($)</th>
            <th className="border px-4 py-2">Broken ($)</th>
            <th className="border px-4 py-2">Lost ($)</th>
            <th className="border px-4 py-2">Total ($)</th>
            <th className="border px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {records.map(r => {
            const { latePenalty, brokenPenalty, lostPenalty, total, overdue } = calculatePenalty(r);
            return (
              <tr key={r.id}>
                <td className="border px-4 py-2">{r.customer?.name}</td>
                <td className="border px-4 py-2">{r.book?.title}</td>
                <td className="border px-4 py-2">{new Date(r.borrowDate).toLocaleDateString()}</td>
                <td className="border px-4 py-2">{new Date(r.dueDate).toLocaleDateString()}</td>

                {/* Broken Pages */}
                <td className="border px-4 py-2">
                  {(role === "ADMIN" || role === "LIBRARIAN") ? (
                    <select
                      value={r.brokenPages > 0 ? "yes" : "no"}
                      onChange={(e) => handleFieldChange(r.id, "brokenPages", e.target.value === "yes" ? 1 : 0)}
                      className="border rounded p-1"
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  ) : r.brokenPages > 0 ? "Yes" : "No"}
                </td>

                {/* Lost */}
                <td className="border px-4 py-2">
                  {(role === "ADMIN" || role === "LIBRARIAN") ? (
                    <select
                      value={r.lost ? "yes" : "no"}
                      onChange={(e) => handleFieldChange(r.id, "lost", e.target.value === "yes")}
                      className="border rounded p-1"
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  ) : r.lost ? "Yes" : "No"}
                </td>

                {/* Overdue */}
                <td className="border px-4 py-2">
                  {(role === "ADMIN" || role === "LIBRARIAN") ? (
                    <select
                      value={overdue ? "yes" : "no"}
                      onChange={(e) => handleFieldChange(r.id, "overdueFlag", e.target.value === "yes")}
                      className="border rounded p-1"
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  ) : overdue ? "Yes" : "No"}
                </td>

                {/* Penalties */}
                <td className="border px-4 py-2">{latePenalty}</td>
                <td className="border px-4 py-2">{brokenPenalty}</td>
                <td className="border px-4 py-2">{lostPenalty}</td>
                <td className="border px-4 py-2 font-bold">{total}</td>

                {/* Status */}
                <td className="border px-4 py-2">
                  {(role === "ADMIN" || role === "LIBRARIAN") ? (
                    <select
                      value={r.status ? "true" : "false"}
                      onChange={(e) => handleFieldChange(r.id, "status", e.target.value === "true")}
                      className="border rounded p-1"
                    >
                      <option value="false">Pending</option>
                      <option value="true">Resolved</option>
                    </select>
                  ) : r.status ? "Resolved" : "Pending"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>}
    </div>
  );
};

export default Penality;
