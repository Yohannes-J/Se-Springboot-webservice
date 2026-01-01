import { useState, useEffect, useMemo } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PenaltyModal from "../components/PenaltyModal";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export default function ReturnBook() {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showPenaltyModal, setShowPenaltyModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const itemsPerPage = 5;
  const token = localStorage.getItem("token");

  const authHeaders = () =>
    token ? { Authorization: `Bearer ${token}` } : {};

  // ================= FETCH =================
  const fetchRecords = async () => {
    try {
      const res = await fetch(`${BASE_URL}/borrow/all`, {
        headers: authHeaders(),
      });

      if (!res.ok) throw new Error("Failed to fetch records");

      const data = await res.json();
      setRecords(data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load borrowed books!");
    }
  };

  // ================= FILTER =================
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

  // ================= PAGINATION =================
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRecords = filteredRecords.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // ================= RETURN BOOK =================
  const returnBook = async (id) => {
    const record = records.find((r) => r.id === id);
    if (!record) return;

    if (
      !window.confirm(
        `Are you sure you want to return "${record.book?.title}"?`
      )
    )
      return;

    try {
      const res = await fetch(`${BASE_URL}/borrow/return/${id}`, {
        method: "PUT",
        headers: authHeaders(),
      });

      if (!res.ok) throw new Error("Failed to return book");

      toast.success("Book returned successfully!");

      setRecords((prev) =>
        prev.map((r) => (r.id === id ? { ...r, returned: true } : r))
      );
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!");
    }
  };

  // ================= UNDO RETURN =================
  const undoReturn = async (id) => {
    const record = records.find((r) => r.id === id);
    if (!record) return;

    if (
      !window.confirm(`Undo return for "${record.book?.title}"?`)
    )
      return;

    try {
      const res = await fetch(`${BASE_URL}/borrow/undo-return/${id}`, {
        method: "PUT",
        headers: authHeaders(),
      });

      if (!res.ok) throw new Error("Failed to undo return");

      toast.info("Return undone");

      setRecords((prev) =>
        prev.map((r) => (r.id === id ? { ...r, returned: false } : r))
      );
    } catch (error) {
      console.error(error);
      toast.error("Could not undo return");
    }
  };

  // ================= HELPERS =================
  const isOverdue = (returnDate) => {
    if (!returnDate) return false;
    return new Date(returnDate) < new Date();
  };

  // ================= EFFECTS =================
  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus]);

  // ================= UI =================
  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-2xl">
        <div className="p-6 border-b flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              Return Borrowed <span className="text-blue-600">Books</span>
            </h2>
            <p className="text-gray-500">
              Manage library returns and penalties
            </p>
          </div>

          <div className="flex gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border px-4 py-2 rounded-lg"
            >
              <option value="all">All</option>
              <option value="returned">Returned</option>
              <option value="unreturned">Unreturned</option>
            </select>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="border px-4 py-2 rounded-lg"
            />
          </div>
        </div>

        <div className="p-6 overflow-x-auto">
          {currentRecords.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              No records found
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 text-sm font-bold">
                <tr>
                  <th className="p-3 text-left">Customer</th>
                  <th className="p-3 text-left">Book</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Borrow</th>
                  <th className="p-3">Due</th>
                  <th className="p-3">Penalty</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {currentRecords.map((r) => {
                  const overdue =
                    !r.returned && isOverdue(r.returnDate);

                  return (
                    <tr
                      key={r.id}
                      className={`border-t ${
                        overdue ? "bg-red-50" : ""
                      }`}
                    >
                      <td className="p-3">{r.customer?.name}</td>
                      <td className="p-3">{r.book?.title}</td>
                      <td className="p-3 font-bold">
                        {r.returned
                          ? "Returned"
                          : overdue
                          ? "Overdue"
                          : "Active"}
                      </td>
                      <td className="p-3">
                        {r.borrowDate
                          ? new Date(r.borrowDate).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="p-3">
                        {r.returnDate
                          ? new Date(r.returnDate).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => {
                            setSelectedRecord(r);
                            setShowPenaltyModal(true);
                          }}
                          className="bg-orange-500 text-white px-3 py-1 rounded text-xs"
                        >
                          Manage
                        </button>
                      </td>
                      <td className="p-3 flex gap-2">
                        {!r.returned ? (
                          <button
                            onClick={() => returnBook(r.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded text-xs"
                          >
                            Return
                          </button>
                        ) : (
                          <button
                            onClick={() => undoReturn(r.id)}
                            className="bg-gray-300 px-3 py-1 rounded text-xs"
                          >
                            Undo
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showPenaltyModal && selectedRecord && (
        <PenaltyModal
          record={selectedRecord}
          onClose={() => {
            setShowPenaltyModal(false);
            setSelectedRecord(null);
          }}
          onSave={() => fetchRecords()}
        />
      )}
    </div>
  );
}
