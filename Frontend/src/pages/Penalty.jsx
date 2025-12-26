import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

const Penalty = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
<<<<<<< Updated upstream
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const token = localStorage.getItem("token");
  const rawRole = localStorage.getItem("role") || "USER";
  const role = rawRole.replace("ROLE_", "").toUpperCase();

  const headers = { Authorization: `Bearer ${token}` };
=======
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [exportOption, setExportOption] = useState("all");

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const headers = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );
>>>>>>> Stashed changes

  const BROKEN_PAGE_FINE = 2;

  useEffect(() => {
<<<<<<< Updated upstream
=======
    const fetchRecords = async () => {
      setLoading(true);
      try {
        const res = await axios.get("https://localhost:8081/api/borrow/all", {
          headers,
        });
        const data = Array.isArray(res.data) ? res.data : [];
        // Initialize latePenalty and lostPrice if missing
        data.forEach((r) => {
          r.latePenalty = r.latePenalty ?? 0;
          r.lostPrice = r.lostPrice ?? 0;
        });
        setRecords(data);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch borrow records.");
      } finally {
        setLoading(false);
      }
    };
>>>>>>> Stashed changes
    fetchRecords();
  }, [headers]);

<<<<<<< Updated upstream
  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await axios.get("https://localhost:8081/api/penalties/all", { headers });
      setRecords(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch records");
    } finally {
      setLoading(false);
    }
  };

  const calculatePenalty = (r) => {
    const latePenalty = parseFloat(r.latePenalty || 0);
    
    // 1. Get the book price from the record (fallback to 50 if book or price is missing)
    const bookPrice = r.book?.price ?? 50;

    const brokenPagesCount = r.brokenPages ?? r.borrowBook?.brokenPages ?? 0;
    const isLost = r.lost === true || r.borrowBook?.lost === true;

    const brokenPenalty = brokenPagesCount * BROKEN_PAGE_FINE;
    
    // 2. Use the dynamic bookPrice here
    const lostPenalty = isLost ? bookPrice : 0;
    
    const total = latePenalty + brokenPenalty + lostPenalty;

    let currentStatus = "pending";
    if (r.status === true || r.paid === true || r.borrowBook?.status === true) {
      currentStatus = total > 0 ? "paid" : "resolved";
    }

    return { total, currentStatus, isLost, brokenPagesCount, bookPrice };
  };

  const handleFieldChange = async (record, field, value) => {
    let updatedRecord = { ...record, [field]: value };
    
    if (field === "status") {
      const isResolved = (value === "paid" || value === "resolved");
      updatedRecord.status = isResolved;
      updatedRecord.paid = isResolved;
    }

    const { total } = calculatePenalty(updatedRecord);
    
    const payload = {
      ...updatedRecord,
      totalPenalty: total,
    };

    try {
      setRecords(records.map((r) => (r.id === record.id ? updatedRecord : r)));
      await axios.put(`https://localhost:8081/api/penalties/update/${record.id}`, payload, { headers });
    } catch (err) {
      console.error(err);
      alert("Failed to sync penalty to database.");
      fetchRecords(); 
    }
  };

  const downloadCSV = () => {
    const headers = ["Customer,Email,Book,Borrowed Date,Due Date,Broken Pages,Lost,Overdue,Total Fine,Status"];
    const rows = filteredRecords.map(r => {
      const { total, currentStatus, isLost, brokenPagesCount } = calculatePenalty(r);
      return [
        r.customer?.name,
        r.customer?.email,
        `"${r.book?.title}"`,
        r.borrowBook?.borrowDate?.split('T')[0],
        r.borrowBook?.returnDate?.split('T')[0],
        brokenPagesCount > 0 ? "Yes" : "No",
        isLost ? "Yes" : "No",
        r.overdue ? "Yes" : "No",
        total.toFixed(2),
        currentStatus.toUpperCase()
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `penalty_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRecords = records.filter((r) => {
    const matchesSearch = 
      r.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.book?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const { currentStatus } = calculatePenalty(r);
    const matchesStatus = filterStatus === "all" || currentStatus === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const selectClass = "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5 shadow-sm transition-all";

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-[1400px] mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
        
        {/* HEADER SECTION */}
        <div className="p-6 border-b border-gray-100 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">
              Borrowed Books & <span className="text-blue-600">Penalties</span>
            </h2>
            <p className="text-gray-500 mt-1 italic">Managing Damages, Loss, and Late Fees.</p>
          </div>
            <button 
              onClick={downloadCSV}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shadow-md active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download CSV
            </button>
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className="p-6 bg-gray-50/50 border-b border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative col-span-2">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search by customer name, email or book title..."
              className="pl-10 w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm font-medium"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending Only</option>
            <option value="paid">Paid Only</option>
            <option value="resolved">Resolved Only</option>
          </select>
        </div>

        {/* TABLE SECTION */}
        <div className="p-6">
=======
  // Calculate broken penalty
  const calculateBrokenPenalty = (r) => (r.brokenPages || 0) * BROKEN_PAGE_FINE;

  // Handle inline changes
  const handleChange = (id, field, value) => {
    setRecords((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        if (
          field === "brokenPages" ||
          field === "latePenalty" ||
          field === "lostPrice"
        ) {
          return { ...r, [field]: Number(value) };
        }
        if (field === "lost") {
          return {
            ...r,
            lost: value === "Yes",
            lostPrice: value === "No" ? 0 : r.lostPrice,
          };
        }
        if (field === "status") return { ...r, status: value === "Resolved" };
        return r;
      })
    );
  };

  // Select/unselect records for export
  const handleSelectRecord = (id, checked) => {
    setSelectedRecords((prev) =>
      checked ? [...prev, id] : prev.filter((rid) => rid !== id)
    );
  };

  // Send penalty notification
  const sendPenalty = async (r) => {
    if (r.latePenalty === "" || r.latePenalty === null) {
      alert("Late (ETB) is required.");
      return;
    }
    try {
      setSending(true);
      await axios.post(
        "https://localhost:8081/api/notifications",
        {
          title: "Library Penalty",
          message: `You have a penalty of ${
            r.latePenalty +
            calculateBrokenPenalty(r) +
            (r.lost ? r.lostPrice : 0)
          } ETB for "${r.book?.title}"`,
          receiverRole: "CUSTOMER",
          receiverCustomerId: r.customer?.id,
        },
        { headers }
      );
      alert("Penalty sent successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to send penalty.");
    } finally {
      setSending(false);
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    const exportRecords =
      exportOption === "selected"
        ? records.filter((r) => selectedRecords.includes(r.id))
        : records;

    if (exportOption === "selected" && exportRecords.length === 0) {
      alert("No records selected for export!");
      return;
    }

    const data = exportRecords.map((r) => {
      const brokenPenalty = calculateBrokenPenalty(r);
      return {
        Customer: r.customer?.name,
        Book: r.book?.title,
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
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Penalties");
    XLSX.writeFile(workbook, "penalties.xlsx");
  };

  // Filter by search
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
>>>>>>> Stashed changes
          {loading ? (
            <p className="text-center py-20">Loading...</p>
          ) : filteredRecords.length === 0 ? (
            <p className="text-center py-20 text-gray-500">
              No borrow records found.
            </p>
          ) : (
<<<<<<< Updated upstream
            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-inner">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100/80">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Book</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Book Price</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Borrowed Date</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Due Date</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Broken Pages</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Lost</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Overdue</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">Total ($)</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Action / Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredRecords.length > 0 ? filteredRecords.map((r) => {
                    const { total, currentStatus, isLost, brokenPagesCount, bookPrice } = calculatePenalty(r);
                    const hasFine = total > 0;

                    return (
                      <tr key={r.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">{r.customer?.name}</div>
                          <div className="text-xs text-gray-500 font-medium">{r.customer?.email}</div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600 italic truncate max-w-[140px]">
                          {r.book?.title}
                        </td>
                        {/* DYNAMIC BOOK PRICE CELL */}
                        <td className="px-4 py-4 text-sm text-gray-500 font-semibold">
                          ${bookPrice.toFixed(2)}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {r.borrowBook?.borrowDate ? new Date(r.borrowBook.borrowDate).toLocaleDateString() : "N/A"}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {r.borrowBook?.returnDate ? new Date(r.borrowBook.returnDate).toLocaleDateString() : "N/A"}
                        </td>
                        <td className="px-4 py-4">
                          {role === "ADMIN" || role === "LIBRARIAN" ? (
                            <select 
                                value={brokenPagesCount > 0 ? "yes" : "no"} 
                                onChange={(e) => handleFieldChange(r, "brokenPages", e.target.value === "yes" ? 1 : 0)} 
                                className={selectClass}
                            >
                              <option value="no">No</option>
                              <option value="yes">Yes</option>
                            </select>
                          ) : (
                            <span className={brokenPagesCount > 0 ? "text-red-600 font-bold" : "text-gray-400"}>
                                {brokenPagesCount > 0 ? "Yes" : "No"}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          {role === "ADMIN" || role === "LIBRARIAN" ? (
                            <select 
                                value={isLost ? "yes" : "no"} 
                                onChange={(e) => handleFieldChange(r, "lost", e.target.value === "yes")} 
                                className={selectClass}
                            >
                              <option value="no">No</option>
                              <option value="yes">Yes</option>
                            </select>
                          ) : (
                            <span className={isLost ? "text-red-600 font-bold" : "text-gray-400"}>
                                {isLost ? "Yes" : "No"}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                           <span className={r.overdue ? "text-red-600 font-bold" : "text-green-600 font-bold"}>{r.overdue ? "Yes" : "No"}</span>
                        </td>
                        <td className="px-4 py-4 text-center font-black text-blue-700 bg-blue-50/30">
                          ${total.toFixed(2)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {role === "ADMIN" || role === "LIBRARIAN" ? (
                            <select
                              value={currentStatus}
                              onChange={(e) => handleFieldChange(r, "status", e.target.value)}
                              className={`${selectClass} ${currentStatus === "pending" ? "text-amber-700 bg-amber-50" : "text-green-700 bg-green-50"}`}
                            >
                              <option value="pending">Pending</option>
                              {hasFine ? <option value="paid">Paid</option> : <option value="resolved">Resolved</option>}
                            </select>
                          ) : (
                            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${currentStatus === "pending" ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"}`}>
                              {currentStatus}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan="10" className="px-4 py-20 text-center text-gray-500 font-medium">
                        No penalty records found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
=======
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
                    (r.latePenalty || 0) +
                    brokenPenalty +
                    (r.lost ? r.lostPrice : 0);
                  const isSelected = selectedRecords.includes(r.id);

                  return (
                    <tr
                      key={r.id}
                      className={
                        isSelected ? "bg-blue-100" : "hover:bg-gray-50"
                      }
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
                            handleChange(r.id, "brokenPages", e.target.value)
                          }
                          className="border px-2 py-1 rounded w-20"
                        />
                      </td>
                      <td className={`px-4 py-3 ${getLostColor(r.lost)}`}>
                        <select
                          value={r.lost ? "Yes" : "No"}
                          onChange={(e) =>
                            handleChange(r.id, "lost", e.target.value)
                          }
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
                          required
                          onChange={(e) =>
                            handleChange(r.id, "latePenalty", e.target.value)
                          }
                          className="border px-2 py-1 rounded w-20 text-center"
                        />
                      </td>
                      <td
                        className={`px-4 py-3 text-center ${getPenaltyColor(
                          brokenPenalty
                        )}`}
                      >
                        {brokenPenalty}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {r.lost && (
                          <input
                            type="number"
                            value={r.lostPrice || 0}
                            min={0}
                            onChange={(e) =>
                              handleChange(r.id, "lostPrice", e.target.value)
                            }
                            className="border px-2 py-1 rounded w-20 text-center"
                          />
                        )}
                        {!r.lost && <span className="text-gray-500">0</span>}
                      </td>
                      <td
                        className={`px-4 py-3 text-center font-semibold ${getPenaltyColor(
                          total
                        )}`}
                      >
                        {total}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <select
                          value={r.status ? "Resolved" : "Pending"}
                          onChange={(e) =>
                            handleChange(r.id, "status", e.target.value)
                          }
                          className={`px-3 py-1 rounded-full ${getStatusColor(
                            r.status
                          )}`}
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
>>>>>>> Stashed changes
          )}
        </div>
      </div>
    </div>
  );
};

<<<<<<< Updated upstream
export default Penalty;
=======
export default Penalty;
>>>>>>> Stashed changes
