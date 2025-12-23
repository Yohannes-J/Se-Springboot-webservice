import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BASE_URL = "https://localhost:8081/api";

export default function ReturnBook() {
  const [records, setRecords] = useState([]);
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

      // Update the returned state locally
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

  useEffect(() => {
    fetchRecords();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-xl">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2 className="text-2xl font-bold mb-4">Return Borrowed Books</h2>

      {records.length === 0 ? (
        <p className="text-center text-gray-500">No borrowed books found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-center">
                <th className="py-2 px-4 border-b">Customer</th>
                <th className="py-2 px-4 border-b">Book</th>
                <th className="py-2 px-4 border-b">Returned</th>
                <th className="py-2 px-4 border-b">Borrow Date</th>
                <th className="py-2 px-4 border-b">Return Date</th>
                <th className="py-2 px-4 border-b">Action</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="text-center">
                  <td className="py-2 px-4 border-b">{r.customer?.name || "-"}</td>
                  <td className="py-2 px-4 border-b">{r.book?.title || "-"}</td>
                  <td className="py-2 px-4 border-b">{r.returned ? "Yes" : "No"}</td>
                  <td className="py-2 px-4 border-b">
                    {r.borrowDate
                      ? new Date(r.borrowDate).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {r.returnDate
                      ? new Date(r.returnDate).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {!r.returned ? (
                      <button
                        className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 transition"
                        onClick={() => returnBook(r.id)}
                      >
                        Return
                      </button>
                    ) : (
                      <span className="text-gray-500 font-semibold">Returned</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
