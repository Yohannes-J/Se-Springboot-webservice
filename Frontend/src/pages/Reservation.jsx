import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PencilIcon, TrashIcon, CheckCircleIcon, ClockIcon } from "lucide-react";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export default function Reservation() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [fulfillingId, setFulfillingId] = useState(null);

  const token = localStorage.getItem("token");
  const authHeaders = () =>
    token ? { Authorization: `Bearer ${token}` } : {};

  const statusColors = {
    PENDING: "bg-yellow-100 text-yellow-700 border-yellow-300",
    CANCELLED: "bg-red-100 text-red-700 border-red-300",
    FULFILLED: "bg-green-100 text-green-700 border-green-300",
    EXPIRED: "bg-gray-100 text-gray-700 border-gray-300",
  };

  const statusOptions = ["", "PENDING", "CANCELLED", "FULFILLED", "EXPIRED"];

  const fetchReservations = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.append("page", page);
      params.append("size", "5");

      if (search.trim()) params.append("search", search.trim());
      if (statusFilter) params.append("status", statusFilter);

      const res = await fetch(
        `${BASE_URL}/reservations?${params.toString()}`,
        { headers: authHeaders() }
      );

      if (!res.ok) throw new Error("Failed to fetch reservations");

      const data = await res.json();
      setReservations(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load reservations!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [page, search, statusFilter]);

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${BASE_URL}/reservations/${id}`, {
        method: "PUT",
        headers: {
          ...authHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      toast.success(`Status updated to ${newStatus}`);
      fetchReservations();
      setShowStatusModal(false);
      setSelectedReservation(null);
    } catch (error) {
      toast.error(error.message || "Update failed");
    }
  };

  const deleteReservation = async (id) => {
    if (!confirm("Are you sure you want to delete this reservation?")) return;

    try {
      const res = await fetch(`${BASE_URL}/reservations/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      if (!res.ok) throw new Error("Failed to delete reservation");

      toast.success("Reservation deleted");
      fetchReservations();
    } catch (error) {
      toast.error(error.message || "Delete failed");
    }
  };

  const fulfillReservation = async (reservation) => {
    const confirmMsg = `Issue "${reservation.book?.title}" to ${reservation.customer?.name}?`;
    if (!window.confirm(confirmMsg)) return;

    setFulfillingId(reservation.id);

    try {
      const borrowUrl = `${BASE_URL}/borrow/borrow?customerId=${reservation.customer.id}&bookId=${reservation.book.id}&days=7`;
      const borrowRes = await fetch(borrowUrl, {
        method: "POST",
        headers: authHeaders(),
      });

      if (!borrowRes.ok) {
        const errorText = await borrowRes.text();
        throw new Error(errorText || "Failed to issue book");
      }

      const updateRes = await fetch(`${BASE_URL}/reservations/${reservation.id}`, {
        method: "PUT",
        headers: {
          ...authHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "FULFILLED" }),
      });

      if (!updateRes.ok) throw new Error("Failed to update reservation status");

      toast.success(`Book issued to ${reservation.customer?.name}!`);
      fetchReservations();
    } catch (error) {
      toast.error(error.message || "Failed to fulfill reservation");
    } finally {
      setFulfillingId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateDaysRemaining = (expiryDate) => {
    if (!expiryDate) return null;
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isExpired = (reservation) => {
    if (!reservation.expiryDate) return false;
    return (
      new Date(reservation.expiryDate) < new Date() &&
      reservation.status === "PENDING"
    );
  };

  return (
    <div className="max-w-7xl mx-auto mt-10 p-8">
      <ToastContainer position="top-center" autoClose={4000} />

      <div className="mb-8">
        <h2 className="text-4xl font-extrabold text-gray-900">
          Reservation Management
        </h2>
        <p className="text-gray-500 mt-2">
          View and manage all book reservations
        </p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by customer or book..."
          className="flex-grow px-4 py-3 border-2 rounded-xl"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
        />

        <select
          className="w-48 px-4 py-3 border-2 rounded-xl"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(0);
          }}
        >
          <option value="">All Statuses</option>
          {statusOptions
            .filter((s) => s)
            .map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
        </select>
      </div>

      <div className="bg-white rounded-3xl shadow border overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">Loading...</div>
        ) : reservations.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            No reservations found
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-blue-50">
                <tr>
                  {[
                    "ID",
                    "Customer",
                    "Book",
                    "Reserved",
                    "Expiry",
                    "Days Remaining",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-4 text-left text-xs font-bold uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reservations.map((r) => {
                  const daysRemaining = calculateDaysRemaining(r.expiryDate);
                  const expired = isExpired(r);

                  return (
                    <tr
                      key={r.id}
                      className={`border-t hover:bg-gray-50 ${
                        expired ? "bg-red-50" : ""
                      }`}
                    >
                      <td className="px-6 py-4 font-bold">#{r.id}</td>
                      <td className="px-6 py-4">{r.customer?.name}</td>
                      <td className="px-6 py-4">{r.book?.title}</td>
                      <td className="px-6 py-4">{formatDate(r.reservationDate)}</td>
                      <td className="px-6 py-4">{formatDate(r.expiryDate)}</td>
                      <td className="px-6 py-4">
                        {daysRemaining !== null ? (
                          <div className="flex items-center gap-2">
                            <ClockIcon className="h-4 w-4 text-gray-400" />
                            <span
                              className={`font-bold ${
                                daysRemaining < 0
                                  ? "text-red-600"
                                  : daysRemaining <= 2
                                  ? "text-amber-600"
                                  : "text-green-600"
                              }`}
                            >
                              {daysRemaining < 0
                                ? `${Math.abs(daysRemaining)} days ago`
                                : daysRemaining === 0
                                ? "Today"
                                : daysRemaining === 1
                                ? "1 day"
                                : `${daysRemaining} days`}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 text-xs font-bold rounded-full border ${
                            statusColors[r.status] || statusColors.PENDING
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 space-x-2 flex items-center">
                        {r.status === "PENDING" && (
                          <button
                            onClick={() => fulfillReservation(r)}
                            disabled={fulfillingId === r.id}
                            title="Fulfill Reservation"
                            className="p-2 rounded hover:bg-green-100 transition disabled:opacity-50"
                          >
                            <CheckCircleIcon className="h-5 w-5 text-green-600" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedReservation(r);
                            setShowStatusModal(true);
                          }}
                          title="Update Status"
                          className="p-2 rounded hover:bg-blue-100 transition"
                        >
                          <PencilIcon className="h-5 w-5 text-blue-600" />
                        </button>
                        <button
                          onClick={() => deleteReservation(r.id)}
                          title="Delete Reservation"
                          className="p-2 rounded hover:bg-red-100 transition"
                        >
                          <TrashIcon className="h-5 w-5 text-red-600" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="flex justify-between items-center p-6">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 0))}
                disabled={page === 0}
                className={`px-4 py-2 rounded-xl font-bold ${
                  page === 0
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                Previous
              </button>

              <span className="text-sm text-gray-700">
                Page {page + 1} of {totalPages}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
                disabled={page >= totalPages - 1}
                className={`px-4 py-2 rounded-xl font-bold ${
                  page >= totalPages - 1
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>

      {showStatusModal && selectedReservation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96">
            <h3 className="text-xl font-bold mb-4">Update Status</h3>

            <div className="grid grid-cols-2 gap-3">
              {statusOptions
                .filter((s) => s)
                .map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(selectedReservation.id, s)}
                    className={`px-4 py-2 rounded border font-bold ${
                      statusColors[s]
                    }`}
                  >
                    {s}
                  </button>
                ))}
            </div>

            <button
              onClick={() => setShowStatusModal(false)}
              className="mt-6 w-full py-2 bg-gray-200 rounded font-bold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
