import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

const Penalty = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [exportOption, setExportOption] = useState("all");

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const BROKEN_PAGE_FINE = 2;

  // Fetch borrow records
  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      try {
        const res = await axios.get("https://localhost:8081/api/borrow/all", {
          headers,
        });
        const data = res.data.map((r) => ({
          ...r,
          brokenPages: r.brokenPages ?? 0,
          latePenalty: r.latePenalty ?? 0,
          lost: r.lost ?? false,
          lostPrice: r.lostPrice ?? 0,
          status: r.status ?? false,
        }));
        setRecords(data);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch borrow records");
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, [headers]);

  // Save penalty to backend
  const savePenalty = async (r) => {
    try {
      await axios.put(
        `https://localhost:8081/api/borrow/penalty/${r.id}`,
        {
          brokenPages: r.brokenPages,
          latePenalty: r.latePenalty,
          lost: r.lost,
          lostPrice: r.lost ? r.lostPrice : 0,
          status: r.status,
        },
        { headers }
      );
    } catch (err) {
      console.error(err);
      alert("Failed to save penalty");
    }
  };

  // Helpers
  const calculateBrokenPenalty = (r) => (r.brokenPages || 0) * BROKEN_PAGE_FINE;

  const handleChange = (id, field, value) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleBlurSave = (r) => savePenalty(r);

  const handleSelectRecord = (id, checked) => {
    setSelectedRecords((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id)
    );
  };

  // Export to Excel
  const exportToExcel = () => {
    const exportRecords =
      exportOption === "selected"
        ? records.filter((r) => selectedRecords.includes(r.id))
        : records;

    if (!exportRecords.length) {
      alert("No records to export");
      return;
    }

    const data = exportRecords.map((r) => {
      const brokenPenalty = calculateBrokenPenalty(r);
      return {
        Customer: r.customer?.name,
        Book: r.book?.title,
        Returned: r.returned ? "Yes" : "No", // Added to Excel
        "Borrow Date": new Date(r.borrowDate).toLocaleDateString(),
        "Return Date": r.returnDate
          ? new Date(r.returnDate).toLocaleDateString()
          : "N/A",
        "Broken Pages": r.brokenPages,
        Lost: r.lost ? "Yes" : "No",
        "Late (ETB)": r.latePenalty,
        "Broken (ETB)": brokenPenalty,
        "Lost (ETB)": r.lostPrice,
        "Total (ETB)":
          r.latePenalty + brokenPenalty + (r.lost ? r.lostPrice : 0),
        Status: r.status ? "Resolved" : "Pending",
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Penalties");
    XLSX.writeFile(wb, "penalties.xlsx");
  };

  const filteredRecords = useMemo(
    () =>
      records.filter(
        (r) =>
          r.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
          r.book?.title?.toLowerCase().includes(search.toLowerCase())
      ),
    [records, search]
  );

  const getPenaltyColor = (value) =>
    value > 0 ? "text-red-600 font-semibold" : "text-green-600 font-semibold";
  const getLostColor = (lost) =>
    lost ? "text-red-600 font-semibold" : "text-green-600 font-semibold";
  const getStatusColor = (status) =>
    status ? "text-green-600 font-semibold" : "text-blue-600 font-semibold";

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b flex flex-col md:flex-row justify-between gap-4 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              Borrowed Books & <span className="text-blue-600">Penalties</span>
            </h2>
            <p className="text-gray-500 mt-1">Track borrow records and fines</p>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customer or book..."
              className="border px-4 py-2 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <select
              value={exportOption}
              onChange={(e) => setExportOption(e.target.value)}
              className="border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="all">Export All</option>
              <option value="selected">Export Selected</option>
            </select>
            <button
              onClick={exportToExcel}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Export Excel
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="p-6 overflow-x-auto">
          {loading ? (
            <p className="text-center py-20">Loading...</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 text-gray-600 text-sm">
                <tr>
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      onChange={(e) =>
                        setSelectedRecords(
                          e.target.checked ? records.map((r) => r.id) : []
                        )
                      }
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Book</th>
                  <th className="px-4 py-3 text-center">Returned</th>
                  <th className="px-4 py-3 text-left">Borrow Date</th>
                  <th className="px-4 py-3 text-left">Returned Date</th>
                  <th className="px-4 py-3 text-left">Broken Pages</th>
                  <th className="px-4 py-3 text-left">Lost</th>
                  <th className="px-4 py-3 text-center">Late (ETB)</th>
                  <th className="px-4 py-3 text-center">Broken (ETB)</th>
                  <th className="px-4 py-3 text-center">Lost (ETB)</th>
                  <th className="px-4 py-3 text-center">Total (ETB)</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  {(role === "ADMIN" || role === "LIBRARIAN") && (
                    <th className="px-4 py-3 text-center">Send</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredRecords.map((r) => {
                  const brokenPenalty = calculateBrokenPenalty(r);
                  const total =
                    r.latePenalty + brokenPenalty + (r.lost ? r.lostPrice : 0);
                  const isSelected = selectedRecords.includes(r.id);

                  return (
                    <tr
                      key={r.id}
                      className={isSelected ? "bg-blue-100" : "hover:bg-gray-50"}
                    >
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) =>
                            handleSelectRecord(r.id, e.target.checked)
                          }
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                      </td>
                      <td className="px-4 py-3">{r.customer?.name}</td>
                      <td className="px-4 py-3 italic">{r.book?.title}</td>
                      {/* Added Returned Yes/No Column */}
                      <td className="px-4 py-3 text-center font-medium">
                        {r.returned ? "Yes" : "No"}
                      </td>
                      <td className="px-4 py-3">
                        {r.borrowDate
                          ? new Date(r.borrowDate).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        {r.returnDate
                          ? new Date(r.returnDate).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={r.brokenPages || 0}
                          min={0}
                          onChange={(e) =>
                            handleChange(r.id, "brokenPages", Number(e.target.value))
                          }
                          onBlur={() => handleBlurSave(r)}
                          className="border px-2 py-1 rounded w-20"
                        />
                      </td>
                      <td className={`px-4 py-3 ${getLostColor(r.lost)}`}>
                        <select
                          value={r.lost ? "Yes" : "No"}
                          onChange={(e) => {
                            const lost = e.target.value === "Yes";
                            const updated = { ...r, lost, lostPrice: lost ? r.lostPrice : 0 };
                            handleChange(r.id, "lost", lost);
                            savePenalty(updated);
                          }}
                          className="border px-2 py-1 rounded"
                        >
                          <option>No</option>
                          <option>Yes</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="number"
                          value={r.latePenalty || 0}
                          min={0}
                          onChange={(e) =>
                            handleChange(r.id, "latePenalty", Number(e.target.value))
                          }
                          onBlur={() => handleBlurSave(r)}
                          className="border px-2 py-1 rounded w-20 text-center"
                        />
                      </td>
                      <td className={`px-4 py-3 text-center ${getPenaltyColor(brokenPenalty)}`}>
                        {brokenPenalty}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {r.lost && (
                          <input
                            type="number"
                            value={r.lostPrice || 0}
                            min={0}
                            onChange={(e) =>
                              handleChange(r.id, "lostPrice", Number(e.target.value))
                            }
                            onBlur={() => handleBlurSave(r)}
                            className="border px-2 py-1 rounded w-20 text-center"
                          />
                        )}
                        {!r.lost && <span className="text-gray-500">0</span>}
                      </td>
                      <td className={`px-4 py-3 text-center font-semibold ${getPenaltyColor(total)}`}>
                        {total}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <select
                          value={r.status ? "Resolved" : "Pending"}
                          onChange={(e) => {
                            const status = e.target.value === "Resolved";
                            const updated = { ...r, status };
                            handleChange(r.id, "status", status);
                            savePenalty(updated);
                          }}
                          className={`px-3 py-1 rounded-full ${getStatusColor(r.status)}`}
                        >
                          <option>Pending</option>
                          <option>Resolved</option>
                        </select>
                      </td>
                      {(role === "ADMIN" || role === "LIBRARIAN") && (
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => sendPenalty(r)}
                            disabled={sending}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                          >
                            Send
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Penalty;