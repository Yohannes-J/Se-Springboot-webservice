import { useEffect, useState, useMemo } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BASE_URL = "https://localhost:8081/api/books";

export default function Books() {
  const [books, setBooks] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 5;

  const [form, setForm] = useState({
    id: null, title: "", author: "", isbn: "", category: "",
    publishedYear: new Date().getFullYear(), description: "",
    totalCopies: 1, copiesAvailable: 1,
  });

  const [filters, setFilters] = useState({ title: "", author: "", category: "" });

  const authHeaders = (json = true) => {
    const token = localStorage.getItem("token");
    if (!token) return {};
    return json
      ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      : { Authorization: `Bearer ${token}` };
  };

  const fetchBooks = async (page = 1) => {
    try {
      const res = await fetch(
        `${BASE_URL}/list?page=${page - 1}&size=${pageSize}&sortBy=title&sortDir=asc`
      );
      const data = await res.json();
      setBooks(data.data || []);
      setTotalPages(data.totalPages || 1);
      setCurrentPage((data.currentPage ?? 0) + 1);
    } catch {
      toast.error("Failed to load inventory");
    }
  };

  useEffect(() => { fetchBooks(); }, []);

  const saveBook = async (e) => {
    e.preventDefault();
    const url = isEditing ? `${BASE_URL}/update/${form.id}` : `${BASE_URL}/addbook`;
    const method = isEditing ? "PUT" : "POST";
    try {
      const res = await fetch(url, {
        method,
        headers: authHeaders(true),
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success(isEditing ? "Entry updated" : "Book registered");
      resetForm();
      fetchBooks(currentPage);
    } catch {
      toast.error("Admin permission required");
    }
  };

  const deleteBook = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      const res = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
        headers: authHeaders(false),
      });
      if (!res.ok) throw new Error();
      toast.success("Record deleted");
      fetchBooks(currentPage);
    } catch {
      toast.error("Admin permission required");
    }
  };

  const editBook = (book) => {
    setForm(book);
    setIsEditing(true);
    setShowForm(true);
  };

  const resetForm = () => {
    setIsEditing(false);
    setShowForm(false);
    setForm({
      id: null, title: "", author: "", isbn: "", category: "",
      publishedYear: new Date().getFullYear(), description: "",
      totalCopies: 1, copiesAvailable: 1,
    });
  };

  const filteredAndSortedBooks = useMemo(() => {
    return [...books].filter(
      (b) =>
        b.title.toLowerCase().includes(filters.title.toLowerCase()) &&
        b.author.toLowerCase().includes(filters.author.toLowerCase()) &&
        b.category.toLowerCase().includes(filters.category.toLowerCase())
    );
  }, [books, filters]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    fetchBooks(page);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
      <ToastContainer theme="colored" />

      {/* FORM MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={resetForm} />
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl p-8 overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-800">{isEditing ? "Edit Book" : "New Book"}</h2>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 text-sm font-bold uppercase tracking-widest">Close</button>
            </div>
            
            <form onSubmit={saveBook} className="space-y-4">
              {[["Title", "title", "text"], ["Author", "author", "text"], ["ISBN", "isbn", "text"], ["Category", "category", "text"]].map(([label, key, type]) => (
                <div key={key}>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 ml-1">{label}</label>
                  <input
                    type={type}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:border-indigo-500 outline-none transition-all"
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    required={key !== "isbn" && key !== "category"}
                  />
                </div>
              ))}

              <div className="grid grid-cols-3 gap-3">
                {["publishedYear", "totalCopies", "copiesAvailable"].map((key) => (
                  <div key={key}>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 truncate">{key.replace(/([A-Z])/g, ' $1')}</label>
                    <input
                      type="number"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 text-center text-sm font-bold text-slate-700"
                      value={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: +e.target.value })}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 ml-1">Description</label>
                <textarea
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm h-32 resize-none outline-none focus:border-indigo-500"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg">
                {isEditing ? "Update Database" : "Save Entry"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Library <span className="text-indigo-600">Inventory</span></h1>
          <button onClick={() => setShowForm(true)} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md">
            + Add New Book
          </button>
        </header>

        {/* SEARCH BAR */}
        <div className="bg-white p-2 border border-slate-200 rounded-xl shadow-sm flex gap-3 mb-6">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-transparent focus-within:border-indigo-100 focus-within:bg-white transition-all">
            <input 
                placeholder="Search Title..." 
                className="bg-transparent text-sm font-semibold outline-none w-full text-slate-600"
                value={filters.title}
                onChange={(e) => setFilters({...filters, title: e.target.value})}
            />
          </div>
          <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-transparent focus-within:border-indigo-100 focus-within:bg-white transition-all">
            <input 
                placeholder="Search Author..." 
                className="bg-transparent text-sm font-semibold outline-none w-full text-slate-600"
                value={filters.author}
                onChange={(e) => setFilters({...filters, author: e.target.value})}
            />
          </div>
        </div>

        {/* ELEGANT TABLE */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead>
                <tr className="bg-slate-50/80">
                  {["Details", "Summary", "Type & ISBN", "Stock", "Actions"].map((h) => (
                    <th key={h} className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAndSortedBooks.map((b) => (
                  <tr 
                    key={b.id} 
                    className="group transition-all duration-300 ease-out hover:bg-indigo-50/30 hover:shadow-[inset_4px_0_0_0_#4f46e5] hover:translate-x-1"
                  >
                    {/* DETAILS COLUMN (Labeled & Larger) */}
                    <td className="px-6 py-6 min-w-[320px]">
                      <div className="flex flex-col gap-2.5">
                        <div className="flex items-center">
                          <span className="text-[10px] font-bold text-slate-300 uppercase w-16 flex-shrink-0 tracking-tighter">Title</span>
                          <span className="font-extrabold text-slate-900 text-lg leading-tight group-hover:text-indigo-700 transition-colors">
                            {b.title}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-[10px] font-bold text-slate-300 uppercase w-16 flex-shrink-0 tracking-tighter">Author</span>
                          <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">
                            {b.author}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* SUMMARY */}
                    <td className="px-6 py-6 max-w-xs">
                      <p className="text-[13px] text-slate-500 line-clamp-2 italic leading-relaxed font-medium">
                        {b.description || "No description provided."}
                      </p>
                    </td>

                    {/* TYPE & ISBN */}
                    <td className="px-6 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 uppercase w-fit group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                          {b.category || 'General'}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 font-medium">
                          {b.isbn || 'N/A'}
                        </span>
                      </div>
                    </td>

                    {/* STOCK */}
                    <td className="px-6 py-6">
                      <div className="flex flex-col gap-1.5">
                        <div className="text-sm font-black text-slate-700">
                          {b.copiesAvailable} <span className="text-slate-300 font-normal">/ {b.totalCopies}</span>
                        </div>
                        <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 rounded-full transition-all duration-700" 
                            style={{ width: `${(b.copiesAvailable / b.totalCopies) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>

                    {/* ACTIONS (Fades in on hover) */}
                    <td className="px-6 py-6 text-right">
                      <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 justify-end">
                        <button 
                          onClick={() => editBook(b)} 
                          className="p-2 text-slate-400 hover:text-white hover:bg-indigo-600 rounded-lg transition-all shadow-sm"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                        </button>
                        <button 
                          onClick={() => deleteBook(b.id)} 
                          className="p-2 text-slate-400 hover:text-white hover:bg-rose-500 rounded-lg transition-all shadow-sm"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page {currentPage} of {totalPages}</span>
            <div className="flex gap-2">
              <button 
                disabled={currentPage === 1} 
                onClick={() => handlePageChange(currentPage - 1)} 
                className="px-4 py-1.5 text-[10px] font-black uppercase bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 transition-all"
              >
                Prev
              </button>
              <button 
                disabled={currentPage === totalPages} 
                onClick={() => handlePageChange(currentPage + 1)} 
                className="px-4 py-1.5 text-[10px] font-black uppercase bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-30 transition-all shadow-md shadow-indigo-100"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}