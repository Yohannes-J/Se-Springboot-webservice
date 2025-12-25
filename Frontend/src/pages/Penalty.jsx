import React, { useEffect, useState } from "react";
import axios from "axios";

const Penalty = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const token = localStorage.getItem("token");
  const rawRole = localStorage.getItem("role") || "USER";
  const role = rawRole.replace("ROLE_", "").toUpperCase();

  const headers = { Authorization: `Bearer ${token}` };

  const BROKEN_PAGE_FINE = 2;

  useEffect(() => {
    fetchRecords();
  }, []);

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
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Penalty;