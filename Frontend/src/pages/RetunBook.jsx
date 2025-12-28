import { useState, useEffect, useMemo } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BASE_URL = "https://localhost:8081/api";

export default function ReturnBook() {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // 'all', 'returned', 'unreturned'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const token = localStorage.getItem("token");

  const authHeaders = () => (token ? { Authorization: `Bearer ${token}` } : {});

  // Fetch all borrowed books
  const fetchRecords = async () => {
    try {
      const res = await fetch(`${BASE_URL}/borrow/all`, { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to fetch records");
      const data = await res.json();
      setRecords(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load borrowed books!");
    }
  };

  // Filter Logic
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchesSearch =
        r.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.book?.title?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        filterStatus === "all"
          ? true
          : filterStatus === "returned"
          ? r.returned === true
          : r.returned === false;

      return matchesSearch && matchesStatus;
    });
  }, [records, search, filterStatus]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstItem, indexOfLastItem);

  // Return a book
  const returnBook = async (id) => {
    const record = records.find((r) => r.id === id);
    if (!record) return;

    const confirmReturn = window.confirm(
      `Are you sure you want to return the book "${record.book?.title}" today?`
    );
    if (!confirmReturn) return;

    try {
      const res = await fetch(`${BASE_URL}/borrow/return/${id}`, {
        method: "PUT",
        headers: authHeaders(),
      });

      if (!res.ok) throw new Error("Failed to return book");

      toast.success("Book returned successfully!");

      setRecords((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, returned: true } : r
        )
      );
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!");
    }
  };

  // Undo Return (New functionality added)
  const undoReturn = async (id) => {
    const record = records.find((r) => r.id === id);
    if (!record) return;

    if (!window.confirm(`Undo return for "${record.book?.title}"? (Mistake Correction)`)) return;

    try {
      const res = await fetch(`${BASE_URL}/borrow/undo-return/${id}`, {
        method: "PUT",
        headers: authHeaders(),
      });

      if (!res.ok) throw new Error("Failed to undo return");

      toast.info("Return status reversed.");

      setRecords((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, returned: false } : r
        )
      );
    } catch (error) {
      console.error(error);
      toast.error("Could not undo return.");
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // Reset pagination when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus]);

  return (
    <div className="p-8 min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-2xl overflow-hidden">
        <ToastContainer position="top-right" autoClose={3000} />
        
        {/* Header Section */}
        <div className="p-6 border-b flex flex-col md:flex-row justify-between gap-4 items-center bg-white">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              Return Borrowed <span className="text-blue-600">Books</span>
            </h2>
            <p className="text-gray-500 mt-1">Manage library returns and update book availability</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm text-gray-700"
            >
              <option value="all">All Status</option>
              <option value="returned">Returned</option>
              <option value="unreturned">Unreturned</option>
            </select>
            {/* Search Input */}
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="border px-4 py-2 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
            />
          </div>
        </div>

        <div className="p-6">
          {currentRecords.length === 0 ? (
            <div className="py-20 text-center">
              <div className="text-gray-300 text-6xl mb-4">📚</div>
              <p className="text-xl text-gray-500 font-medium">No records found matching your criteria.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 text-gray-600 text-sm font-bold uppercase tracking-wider">
                    <tr className="text-center">
                      <th className="py-4 px-4 text-left">Customer</th>
                      <th className="py-4 px-4 text-left">Book</th>
                      <th className="py-4 px-4">Returned</th>
                      <th className="py-4 px-4">Borrow Date</th>
                      <th className="py-4 px-4">Return Date</th>
                      <th className="py-4 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {currentRecords.map((r) => (
                      <tr key={r.id} className="text-center hover:bg-gray-50 transition duration-150">
                        <td className="py-4 px-4 text-left text-sm font-semibold text-gray-700">
                          {r.customer?.name || "-"}
                        </td>
                        <td className="py-4 px-4 text-left text-sm text-gray-600 italic">
                          {r.book?.title || "-"}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-700">
                          {r.returned ? (
                            <span className="text-green-600 font-bold">Yes</span>
                          ) : (
                            <span className="text-red-600 font-bold">No</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-500">
                          {r.borrowDate ? new Date(r.borrowDate).toLocaleDateString() : "N/A"}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-500">
                          {r.returnDate ? new Date(r.returnDate).toLocaleDateString() : "N/A"}
                        </td>
                        <td className="py-4 px-4">
                          {!r.returned ? (
                            <button
                              className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded font-bold text-xs shadow-sm transition active:scale-95"
                              onClick={() => returnBook(r.id)}
                            >
                              Return
                            </button>
                          ) : (
                            <button
                              className="bg-gray-200 hover:bg-gray-300 text-gray-700 border border-gray-300 px-4 py-1.5 rounded font-bold text-xs shadow-sm transition active:scale-95"
                              onClick={() => undoReturn(r.id)}
                            >
                              Undo Return
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="flex justify-between items-center mt-6 px-2">
                <span className="text-sm text-gray-600">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredRecords.length)} of {filteredRecords.length} entries
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}