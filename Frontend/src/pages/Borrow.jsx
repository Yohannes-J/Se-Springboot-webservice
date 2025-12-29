import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Using http to avoid SSL issues on localhost
const BASE_URL = import.meta.env.VITE_BACKEND_URL;

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
  ).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

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
      toast.error("Failed to load library data!");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ================= HELPERS =================
  // Checks how many copies of a specific book are currently out
  const borrowedCount = (bookId) =>
    borrowed.filter((b) => b.book?.id === bookId && !b.returned).length;

  const availableCopies = (book) => (book.totalCopies || 0) - borrowedCount(book.id);

  // Checks if a student currently has ANY book that hasn't been returned
  const getActiveBorrowRecord = (customerId) => {
    return borrowed.find((b) => b.customer?.id === customerId && !b.returned);
  };

  // ================= SEARCH LOGIC =================
  useEffect(() => {
    if (!bookQuery.trim() || data.bookId) return setBookResults([]);
    const q = bookQuery.toLowerCase();
    setBookResults(
      books.filter(b => 
        b.title.toLowerCase().includes(q) || 
        b.author?.toLowerCase().includes(q) || 
        b.isbn?.toLowerCase().includes(q)
      ).slice(0, 5)
    );
  }, [bookQuery, books, data.bookId]);

  useEffect(() => {
    if (!customerQuery.trim() || data.customerId) return setCustomerResults([]);
    const q = customerQuery.toLowerCase();
    setCustomerResults(
      customers.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.email?.toLowerCase().includes(q)
      ).slice(0, 5)
    );
  }, [customerQuery, customers, data.customerId]);

  // ================= BORROW ACTION =================
  const borrowBook = async () => {
    if (!data.customerId || !data.bookId) {
      toast.warning("Please select both a customer and a book!");
      return;
    }

    // 1. Check if student already has a book (The restriction logic)
    const activeRecord = getActiveBorrowRecord(data.customerId);
    if (activeRecord) {
      toast.error(`Access Denied: Student has unreturned book: "${activeRecord.book?.title}"`);
      return;
    }

    // 2. Check physical availability
    const book = books.find((b) => b.id === data.bookId);
    if (!book || availableCopies(book) <= 0) {
      toast.error("Inventory Error: No physical copies available!");
      return;
    }

    try {
      const url = `${BASE_URL}/borrow/borrow?customerId=${data.customerId}&bookId=${data.bookId}&days=${data.days}`;
      const res = await fetch(url, { method: "POST", headers: authHeaders() });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Server rejected the transaction");
      }

      toast.success("Transaction Complete: Book issued successfully!");
      
      // Reset state and refresh global data
      fetchData();
      setData({ customerId: "", bookId: "", days: 7 });
      setCustomerQuery("");
      setBookQuery("");
    } catch (err) {
      toast.error(err.message || "Borrowing failed!");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-8 bg-white shadow-2xl rounded-3xl border border-gray-100">
      <ToastContainer position="top-center" autoClose={4000} />
      
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900">Library Issue Desk</h2>
        <p className="text-gray-500">Search and assign books to library patrons.</p>
      </div>

      <div className="space-y-6">
        {/* CUSTOMER SEARCH */}
        <div className="relative">
          <label className="text-sm font-semibold text-gray-700 block mb-2 uppercase tracking-wide">Patron Search</label>
          <input
            className={`w-full pl-4 pr-10 py-3 border-2 rounded-xl outline-none transition-all ${data.customerId ? 'border-green-500 bg-green-50' : 'border-gray-100 focus:border-indigo-500'}`}
            placeholder="Name or Email..."
            value={customerQuery}
            onChange={(e) => {
              setCustomerQuery(e.target.value);
              if (data.customerId) setData({...data, customerId: ""});
            }}
          />
          
          {customerResults.length > 0 && (
            <div className="absolute z-20 w-full mt-2 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden">
              {customerResults.map((c) => {
                const active = getActiveBorrowRecord(c.id);
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      if (active) {
                        toast.error(`${c.name} cannot borrow until "${active.book?.title}" is returned.`);
                        return;
                      }
                      setData({ ...data, customerId: c.id });
                      setCustomerQuery(`${c.name} (${c.email})`);
                      setCustomerResults([]);
                    }}
                    className={`p-4 border-b border-gray-50 cursor-pointer flex justify-between items-center ${active ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-indigo-50'}`}
                  >
                    <div>
                      <div className={`font-bold ${active ? 'text-red-700' : 'text-gray-800'}`}>{c.name}</div>
                      <div className="text-xs text-gray-400">{c.email}</div>
                    </div>
                    {active && <span className="text-[10px] bg-red-600 text-white px-2 py-1 rounded font-bold">HAS UNRETURNED BOOK</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* BOOK SEARCH */}
        <div className="relative">
          <label className="text-sm font-semibold text-gray-700 block mb-2 uppercase tracking-wide">Select Book</label>
          <input
            className={`w-full pl-4 pr-10 py-3 border-2 rounded-xl outline-none transition-all ${data.bookId ? 'border-green-500 bg-green-50' : 'border-gray-100 focus:border-indigo-500'}`}
            placeholder="Title, Author, or ISBN..."
            value={bookQuery}
            onChange={(e) => {
              setBookQuery(e.target.value);
              if (data.bookId) setData({...data, bookId: ""});
            }}
          />

          {bookResults.length > 0 && (
            <div className="absolute z-10 w-full mt-2 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden">
              {bookResults.map((b) => {
                const available = availableCopies(b);
                const isOutOfStock = available <= 0;
                return (
                  <div
                    key={b.id}
                    onClick={() => {
                      if (isOutOfStock) return;
                      setData({ ...data, bookId: b.id });
                      setBookQuery(b.title);
                      setBookResults([]);
                    }}
                    className={`p-4 border-b border-gray-50 transition-all ${isOutOfStock ? "bg-gray-50 opacity-60 cursor-not-allowed" : "cursor-pointer hover:bg-green-50"}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-gray-800">{b.title}</div>
                        <div className="text-xs text-gray-500">{b.author}</div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${available > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {available} in stock
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2 uppercase tracking-wide">Loan Period (Days)</label>
            <input
              type="number"
              className="w-full p-3 border-2 border-gray-100 rounded-xl outline-none font-bold text-indigo-600"
              value={data.days}
              onChange={(e) => setData({ ...data, days: e.target.value })}
            />
          </div>
          <div className="flex flex-col justify-end">
            <div className="p-3 bg-indigo-50 border-2 border-indigo-100 rounded-xl">
              <span className="text-[10px] font-bold text-indigo-400 block uppercase">Due Back</span>
              <span className="text-sm font-bold text-indigo-700">{dueDate}</span>
            </div>
          </div>
        </div>

        <button
          onClick={borrowBook}
          disabled={!data.customerId || !data.bookId}
          className={`w-full py-4 mt-4 rounded-2xl font-bold text-white transition-all shadow-lg ${
            !data.customerId || !data.bookId
              ? "bg-gray-200 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-indigo-200"
          }`}
        >
          Confirm Issuance
        </button>
      </div>
    </div>
  );
}