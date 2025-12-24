import React, { useEffect, useState } from "react";
import axios from "axios";

const Penality = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role"); // ADMIN, LIBRARIAN, USER
  const headers = { Authorization: `Bearer ${token}` };

  const LATE_FINE_PER_DAY = 5;
  const BROKEN_PAGE_FINE = 2;
  const LOST_BOOK_FINE = 50;

  // Fetch borrow records
  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      try {
        const res = await axios.get("https://localhost:8081/api/borrow/all", {
          headers,
        });
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

    const latePenalty = overdue
      ? Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24)) * LATE_FINE_PER_DAY
      : 0;
    const brokenPenalty = (r.brokenPages || 0) * BROKEN_PAGE_FINE;
    const lostPenalty = r.lost ? LOST_BOOK_FINE : 0;

    return {
      latePenalty,
      brokenPenalty,
      lostPenalty,
      total: latePenalty + brokenPenalty + lostPenalty,
      overdue,
    };
  };

  // Update borrow record fields
  const handleFieldChange = async (id, field, value) => {
    try {
      setRecords(
        records.map((r) => (r.id === id ? { ...r, [field]: value } : r))
      );

      // Send update to backend
      await axios.put(
        `https://localhost:8081/api/borrow/update/${id}`,
        { [field]: value },
        { headers }
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update record");
    }
  };

  // Helper for consistent select styling
  const selectClass =
    "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5 shadow-sm transition-all";

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-white">
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">
            Borrowed Books & <span className="text-blue-600">Penalties</span>
          </h2>
          <p className="text-gray-500 mt-1">
            Review student records, track damages, and manage fine settlements.
          </p>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Book
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Borrow Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Broken Pages
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Lost
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Overdue
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider text-center">
                      Late ($)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider text-center">
                      Broken ($)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider text-center">
                      Lost ($)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider text-center">
                      Total ($)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {records.map((r) => {
                    const {
                      latePenalty,
                      brokenPenalty,
                      lostPenalty,
                      total,
                      overdue,
                    } = calculatePenalty(r);
                    return (
                      <tr
                        key={r.id}
                        className="hover:bg-blue-50/30 transition-colors"
                      >
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {r.customer?.name}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 italic">
                          {r.book?.title}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(r.borrowDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(r.dueDate).toLocaleDateString()}
                        </td>

                        {/* Broken Pages */}
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {role === "ADMIN" || role === "LIBRARIAN" ? (
                            <select
                              value={r.brokenPages > 0 ? "yes" : "no"}
                              onChange={(e) =>
                                handleFieldChange(
                                  r.id,
                                  "brokenPages",
                                  e.target.value === "yes" ? 1 : 0
                                )
                              }
                              className={selectClass}
                            >
                              <option value="no">No</option>
                              <option value="yes">Yes</option>
                            </select>
                          ) : (
                            <span
                              className={`px-2 py-1 rounded-md font-bold ${
                                r.brokenPages > 0
                                  ? "text-red-600 bg-red-50"
                                  : "text-gray-400"
                              }`}
                            >
                              {r.brokenPages > 0 ? "Yes" : "No"}
                            </span>
                          )}
                        </td>

                        {/* Lost */}
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {role === "ADMIN" || role === "LIBRARIAN" ? (
                            <select
                              value={r.lost ? "yes" : "no"}
                              onChange={(e) =>
                                handleFieldChange(
                                  r.id,
                                  "lost",
                                  e.target.value === "yes"
                                )
                              }
                              className={selectClass}
                            >
                              <option value="no">No</option>
                              <option value="yes">Yes</option>
                            </select>
                          ) : (
                            <span
                              className={`px-2 py-1 rounded-md font-bold ${
                                r.lost
                                  ? "text-red-600 bg-red-50"
                                  : "text-gray-400"
                              }`}
                            >
                              {r.lost ? "Yes" : "No"}
                            </span>
                          )}
                        </td>

                        {/* Overdue */}
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {role === "ADMIN" || role === "LIBRARIAN" ? (
                            <select
                              value={overdue ? "yes" : "no"}
                              onChange={(e) =>
                                handleFieldChange(
                                  r.id,
                                  "overdueFlag",
                                  e.target.value === "yes"
                                )
                              }
                              className={selectClass}
                            >
                              <option value="no">No</option>
                              <option value="yes">Yes</option>
                            </select>
                          ) : (
                            <span
                              className={`px-2 py-1 rounded-md font-bold ${
                                overdue
                                  ? "text-red-600 bg-red-50"
                                  : "text-green-600 bg-green-50"
                              }`}
                            >
                              {overdue ? "Yes" : "No"}
                            </span>
                          )}
                        </td>

                        {/* Penalties */}
                        <td className="px-4 py-4 text-center text-sm font-medium text-gray-700">
                          {latePenalty}
                        </td>
                        <td className="px-4 py-4 text-center text-sm font-medium text-gray-700">
                          {brokenPenalty}
                        </td>
                        <td className="px-4 py-4 text-center text-sm font-medium text-gray-700">
                          {lostPenalty}
                        </td>
                        <td className="px-4 py-4 text-center text-sm font-extrabold text-blue-700 bg-blue-50/50">
                          {total}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {role === "ADMIN" || role === "LIBRARIAN" ? (
                            <select
                              value={r.status ? "true" : "false"}
                              onChange={(e) =>
                                handleFieldChange(
                                  r.id,
                                  "status",
                                  e.target.value === "true"
                                )
                              }
                              className={`${selectClass} ${
                                r.status
                                  ? "text-green-700 border-green-200 bg-green-50"
                                  : "text-amber-700 border-amber-200 bg-amber-50"
                              }`}
                            >
                              <option value="false">Pending</option>
                              <option value="true">Resolved</option>
                            </select>
                          ) : (
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                                r.status
                                  ? "bg-green-100 text-green-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {r.status ? "Resolved" : "Pending"}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Penality;
