import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BASE_URL = "https://localhost:8081/api";

export default function Borrow() {
  const [customers, setCustomers] = useState([]);
  const [books, setBooks] = useState([]);
  const [borrowed, setBorrowed] = useState([]);

  const [bookQuery, setBookQuery] = useState("");
  const [bookResults, setBookResults] = useState([]);
  const [customerQuery, setCustomerQuery] = useState("");
  const [customerResults, setCustomerResults] = useState([]);

  const [data, setData] = useState({
    customerId: "",
    bookId: "",
    days: 7,
  });

  const token = localStorage.getItem("token");
  const authHeaders = () => (token ? { Authorization: `Bearer ${token}` } : {});

  const dueDate = new Date(
    Date.now() + Number(data.days) * 24 * 60 * 60 * 1000
  ).toLocaleDateString();

  // ================= FETCH DATA =================
  const fetchData = async () => {
    try {
      const [cRes, bRes, brRes] = await Promise.all([
        fetch(`${BASE_URL}/customers`, { headers: authHeaders() }),
        fetch(`${BASE_URL}/books/list`, { headers: authHeaders() }),
        fetch(`${BASE_URL}/borrow/all`, { headers: authHeaders() }),
      ]);

      const c = cRes.ok ? await cRes.json() : [];
      const b = bRes.ok ? await bRes.json() : [];
      const br = brRes.ok ? await brRes.json() : [];

      setCustomers(c);
      setBooks(b.data || b);
      setBorrowed(br);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load data!");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ================= HELPERS =================
  const borrowedCount = (bookId) =>
    borrowed.filter((b) => b.book.id === bookId && !b.isReturned).length;

  const availableCopies = (book) => book.totalCopies - borrowedCount(book.id);

  // ================= BOOK SEARCH =================
  useEffect(() => {
    if (!bookQuery.trim()) return setBookResults([]);
    const q = bookQuery.toLowerCase();
    setBookResults(
      books
        .filter(
          (b) =>
            b.title.toLowerCase().includes(q) ||
            b.author?.toLowerCase().includes(q) ||
            b.isbn?.toLowerCase().includes(q)
        )
        .slice(0, 10)
    );
  }, [bookQuery, books, borrowed]);

  // ================= CUSTOMER SEARCH =================
  useEffect(() => {
    if (!customerQuery.trim()) return setCustomerResults([]);
    const q = customerQuery.toLowerCase();
    setCustomerResults(
      customers
        .filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.email?.toLowerCase().includes(q)
        )
        .slice(0, 10)
    );
  }, [customerQuery, customers]);

  // ================= BORROW BOOK =================
  const borrowBook = async () => {
    if (!data.customerId || !data.bookId) {
      toast.warning("Select customer and book!");
      return;
    }

    const book = books.find((b) => b.id === data.bookId);
    if (!book || availableCopies(book) <= 0) {
      toast.error("No copies available!");
      return;
    }

    if (!window.confirm("Confirm borrow?")) return;

    try {
      const res = await fetch(
        `${BASE_URL}/borrow/borrow?customerId=${data.customerId}&bookId=${data.bookId}&days=${data.days}`,
        { method: "POST", headers: authHeaders() }
      );

      if (!res.ok) throw new Error(`Borrow failed: ${res.status}`);

      toast.success("Book borrowed!");
      fetchData();
      setData({ customerId: "", bookId: "", days: 7 });
      setCustomerQuery("");
      setBookQuery("");
    } catch (err) {
      console.error(err);
      toast.error("Borrow failed!");
    }
  };

  // ================= UI =================
  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow-xl rounded-xl">
      <ToastContainer />
      <h2 className="text-2xl font-bold mb-4">Borrow Book</h2>

      {/* CUSTOMER SEARCH */}
      <label className="font-medium block mb-1">Search Customer</label>
      <input
        className="border p-2 w-full rounded"
        placeholder="Name or Email"
        value={customerQuery}
        onChange={(e) => setCustomerQuery(e.target.value)}
      />
      {customerResults.length > 0 && (
        <div className="border mt-2 rounded max-h-40 overflow-y-auto">
          {customerResults.map((c) => (
            <div
              key={c.id}
              onClick={() => {
                setData({ ...data, customerId: c.id });
                setCustomerQuery(`${c.name} (${c.email})`);
                setCustomerResults([]);
              }}
              className="p-2 border-b cursor-pointer hover:bg-blue-100"
            >
              <div className="font-medium">{c.name}</div>
              <div className="text-sm text-gray-600">{c.email}</div>
            </div>
          ))}
        </div>
      )}

      {/* BOOK SEARCH */}
      <label className="font-medium block mt-4 mb-1">Search Book</label>
      <input
        className="border p-2 w-full rounded"
        placeholder="Title / Author / ISBN"
        value={bookQuery}
        onChange={(e) => setBookQuery(e.target.value)}
      />
      {bookResults.length > 0 && (
        <div className="border mt-2 rounded max-h-64 overflow-y-auto">
          {bookResults.map((b) => {
            const available = availableCopies(b);
            return (
              <div
                key={b.id}
                onClick={() => {
                  if (available <= 0) return;
                  setData({ ...data, bookId: b.id });
                  setBookQuery(b.title);
                  setBookResults([]);
                }}
                className={`p-2 border-b cursor-pointer ${
                  available <= 0
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
      <label className="font-medium block mt-4 mb-1">Borrow Days</label>
      <input
        type="number"
        min="1"
        max="30"
        className="border p-2 w-full rounded mb-4"
        value={data.days}
        onChange={(e) => setData({ ...data, days: e.target.value })}
      />

      {/* DUE DATE */}
      <div className="mb-4 p-2 bg-gray-100 rounded border">
        <strong>Due Date:</strong> {dueDate}
      </div>

      {/* BUTTON */}
      <button
        onClick={borrowBook}
        disabled={!data.customerId || !data.bookId}
        className={`w-full py-2 rounded text-white ${
          !data.customerId || !data.bookId
            ? "bg-gray-400"
            : "bg-green-600 hover:bg-green-700"
        }`}
      >
        Borrow Book
      </button>
    </div>
  );
}
