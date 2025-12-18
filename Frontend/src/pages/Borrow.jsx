import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BASE_URL = "https://localhost:8081/api";

export default function Borrow() {
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [borrowed, setBorrowed] = useState([]);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const [data, setData] = useState({
    userId: "",
    bookId: "",
    days: 7,
  });

  const token = localStorage.getItem("token");

  const authHeaders = () =>
    token ? { Authorization: `Bearer ${token}` } : {};

  
  const dueDate = data.days
    ? new Date(
        Date.now() + Number(data.days) * 24 * 60 * 60 * 1000
      ).toLocaleDateString()
    : "N/A";

  // 🔹 Load data
  const fetchData = async () => {
    try {
      const [u, b, br] = await Promise.all([
        fetch(`${BASE_URL}/users`, { headers: authHeaders() }).then((r) => r.json()),
        fetch(`${BASE_URL}/books/list`, { headers: authHeaders() }).then((r) => r.json()),
        fetch(`${BASE_URL}/borrow/all`, { headers: authHeaders() }).then((r) => r.json()),
      ]);

      setUsers(u);
      setBooks(b.data || []);
      setBorrowed(br);
    } catch {
      toast.error("Failed to load data!");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  
  const borrowedCount = (bookId) =>
    borrowed.filter(
      (b) => b.book.id === bookId && !b.isReturned
    ).length;

  
  const availableCopies = (book) =>
    book.totalCopies - borrowedCount(book.id);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const q = query.toLowerCase();

    const filtered = books
      .filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          (b.author && b.author.toLowerCase().includes(q)) ||
          (b.isbn && b.isbn.toLowerCase().includes(q))
      )
      .slice(0, 10);

    setResults(filtered);
  }, [query, books, borrowed]);

  
  const borrowBook = async () => {
    if (!data.userId || !data.bookId) {
      toast.warning("Select user and book!");
      return;
    }

    const book = books.find((b) => b.id === data.bookId);
    if (availableCopies(book) <= 0) {
      toast.error("No copies available!");
      return;
    }

    if (!window.confirm("Confirm borrow?")) return;

    try {
      const res = await fetch(
        `${BASE_URL}/borrow/borrow?userId=${data.userId}&bookId=${data.bookId}&days=${data.days}`,
        { method: "POST", headers: authHeaders() }
      );

      if (!res.ok) throw new Error();

      toast.success("Book borrowed!");
      fetchData();

      setData({ userId: "", bookId: "", days: 7 });
      setQuery("");
    } catch {
      toast.error("Borrow failed!");
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow-xl rounded-xl">
      <ToastContainer />

      <h2 className="text-2xl font-bold mb-4">Borrow Book</h2>

      {/* USER */}
      <label className="font-medium block mb-1">Select User</label>
      <select
        className="border p-2 w-full mb-4 rounded"
        value={data.userId}
        onChange={(e) =>
          setData({ ...data, userId: e.target.value })
        }
      >
        <option value="">Choose user</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name} ({u.email})
          </option>
        ))}
      </select>

      {/* SEARCH BOOK */}
      <label className="font-medium block mb-1">Search Book</label>
      <input
        type="text"
        className="border p-2 w-full rounded"
        placeholder="Title / Author / ISBN"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {/* RESULTS */}
      {results.length > 0 && (
        <div className="border mt-2 rounded max-h-64 overflow-y-auto">
          {results.map((b) => {
            const available = availableCopies(b);
            const disabled = available <= 0;

            return (
              <div
                key={b.id}
                onClick={() => {
                  if (disabled) return;
                  setData({ ...data, bookId: b.id });
                  setQuery(b.title);
                  setResults([]);
                }}
                className={`p-2 border-b cursor-pointer ${
                  disabled
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "hover:bg-green-100"
                }`}
              >
                <div className="font-semibold">{b.title}</div>
                <div className="text-sm">
                  {b.author} | ISBN: {b.isbn}
                </div>
                <div
                  className={`text-sm font-medium ${
                    available > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  Available: {available} / {b.totalCopies}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DAYS */}
      <label className="font-medium block mt-4 mb-1">
        Borrow Days
      </label>
      <input
        type="number"
        min="1"
        max="30"
        className="border p-2 w-full rounded mb-4"
        value={data.days}
        onChange={(e) =>
          setData({ ...data, days: e.target.value })
        }
      />

      {/* DUE DATE */}
      <div className="mb-4 p-2 bg-gray-100 rounded border">
        <strong>Due Date:</strong> {dueDate}
      </div>

      {/* BUTTON */}
      <button
        onClick={borrowBook}
        disabled={!data.userId || !data.bookId}
        className={`w-full py-2 rounded text-white ${
          !data.userId || !data.bookId
            ? "bg-gray-400"
            : "bg-green-600 hover:bg-green-700"
        }`}
      >
        Borrow Book
      </button>
    </div>
  );
}
