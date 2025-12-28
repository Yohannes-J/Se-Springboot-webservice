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
  const [pageSize, setPageSize] = useState(10);

  // --- ROLE LOGIC ---
  const rawRole = localStorage.getItem("role") || "USER";
  const userRole = rawRole.replace("ROLE_", "").toUpperCase();
  const canManage = userRole === "ADMIN" || userRole === "LIBRARIAN";

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

  const fetchBooks = async (page = 1, size = pageSize) => {
    try {
      const res = await fetch(
        `${BASE_URL}/list?page=${page - 1}&size=${size}&sortBy=title&sortDir=asc`
      );
      const data = await res.json();
      setBooks(data.data || []);
      setTotalPages(data.totalPages || 1);
      setCurrentPage((data.currentPage ?? 0) + 1);
    } catch {
      toast.error("Failed to load inventory");
    }
  };

  useEffect(() => {
    fetchBooks(1, pageSize);
  }, [pageSize]);

  const saveBook = async (e) => {
    e.preventDefault();
    if (!canManage) return toast.error("Unauthorized"); // Security check
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
    if (!canManage) return; // Security check
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
    if (!canManage) return; // Security check
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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased overflow-x-hidden">
      <ToastContainer theme="colored" />

      {/* Logic: Only render the form/modal if user canManage */}
      {showForm && canManage && (
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

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <header className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">Inventory <span className="text-indigo-600">Control</span></h1>

          {/* Logic: Only show Add button if user canManage */}
          {canManage && (
            <button onClick={() => setShowForm(true)} className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md active:scale-95">
              + Add Book
            </button>
          )}
        </header>

        <div className="bg-white p-1.5 border border-slate-200 rounded-xl shadow-sm flex gap-2 mb-4">
          <input
              placeholder="Search Title..."
              className="flex-1 bg-slate-50 px-3 py-1.5 rounded-lg text-xs font-semibold outline-none border border-transparent focus:border-indigo-200 transition-all"
              value={filters.title}
              onChange={(e) => setFilters({...filters, title: e.target.value})}
          />
          <input
              placeholder="Search Author..."
              className="flex-1 bg-slate-50 px-3 py-1.5 rounded-lg text-xs font-semibold outline-none border border-transparent focus:border-indigo-200 transition-all"
              value={filters.author}
              onChange={(e) => setFilters({...filters, author: e.target.value})}
          />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
          <div className="w-full overflow-hidden">
            <table className="w-full text-left border-separate border-spacing-0 table-fixed">
              <thead>
                <tr className="bg-slate-50/80">
                  <th className="w-[30%] px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-800">Book Detail</th>
                  <th className="w-[25%] px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-800">Summary</th>
                  <th className="w-[20%] px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-800">Catagory and ISDN</th>
                  <th className="w-[15%] px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-800">Stock Status</th>
                  {/* Only show Action header if user canManage */}
                  {canManage && <th className="w-[10%] px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-800 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAndSortedBooks.map((b) => (
                  <tr key={b.id} className="group transition-all duration-300 ease-out hover:bg-indigo-50/40 outline-none">
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5 overflow-hidden">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-800 uppercase w-8 flex-shrink-0">Title</span>
                          <span className="font-bold text-slate-900 text-[13px] truncate block">{b.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[8px] font-bold text-slate-800 uppercase w-8 flex-shrink-0">Author</span>
                          <span className="text-[11px] font-medium text-slate-500 truncate block">{b.author}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[11px] text-slate-800 truncate italic block">{b.description || "No description."}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-indigo-600 uppercase truncate block">{b.category || 'General'}</span>
                        <span className="text-[10px] font-mono text-slate-800 truncate block">{b.isbn || 'No-ISBN'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-black text-slate-700">
                        {b.copiesAvailable}<span className="text-slate-800 font-normal">/{b.totalCopies}</span>
                      </span>
                    </td>

                    {/* Only show Action buttons if user canManage */}
                    {canManage && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => editBook(b)} className="p-2 text-slate-800 hover:text-white hover:bg-indigo-600 rounded-lg">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                          </button>
                          <button onClick={() => deleteBook(b.id)} className="p-2 text-slate-800 hover:text-white hover:bg-rose-500 rounded-lg">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[9px] font-black text-slate-400 uppercase">Page {currentPage} of {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)} className="px-3 py-1 text-[9px] font-black uppercase bg-white border border-slate-200 rounded-lg disabled:opacity-20">Prev</button>
              <button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)} className="px-3 py-1 text-[9px] font-black uppercase bg-indigo-600 text-white rounded-lg disabled:opacity-20">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}