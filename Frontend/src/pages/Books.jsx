import { useEffect, useState, useMemo } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BASE_URL = "https://localhost:8081/api/books";

export default function Books() {
  const [books, setBooks] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 5;

  const [form, setForm] = useState({
    id: null,
    title: "",
    author: "",
    isbn: "",
    category: "",
    publishedYear: new Date().getFullYear(),
    description: "",
    totalCopies: 1,
    copiesAvailable: 1,
  });

  const [filters, setFilters] = useState({
    title: "",
    author: "",
    category: "",
  });

  const [sort, setSort] = useState({
    field: "title",
    direction: "asc",
  });

  // ================= AUTH HEADER =================
  const authHeaders = (json = true) => {
    const token = localStorage.getItem("token");
    if (!token) return {};
    return json
      ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      : { Authorization: `Bearer ${token}` };
  };

  // ================= FETCH BOOKS =================
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
      toast.error("Failed to load books");
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // ================= ADD / UPDATE =================
  const saveBook = async (e) => {
    e.preventDefault();

    const url = isEditing
      ? `${BASE_URL}/update/${form.id}`
      : `${BASE_URL}/addbook`;

    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: authHeaders(true),
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error();

      toast.success(isEditing ? "Book updated successfully" : "Book added successfully");
      resetForm();
      fetchBooks(currentPage);
    } catch {
      toast.error("Admin permission required");
    }
  };

  // ================= DELETE =================
  const deleteBook = async (id) => {
    if (!window.confirm("Delete this book?")) return;

    try {
      const res = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
        headers: authHeaders(false),
      });

      if (!res.ok) throw new Error();

      toast.success("Book deleted successfully");
      fetchBooks(currentPage);
    } catch {
      toast.error("Admin permission required");
    }
  };

  const editBook = (book) => {
    setForm(book);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setIsEditing(false);
    setForm({
      id: null,
      title: "",
      author: "",
      isbn: "",
      category: "",
      publishedYear: new Date().getFullYear(),
      description: "",
      totalCopies: 1,
      copiesAvailable: 1,
    });
  };

  // ================= FILTER + SORT =================
  const filteredAndSortedBooks = useMemo(() => {
    let data = [...books];

    data = data.filter(
      (b) =>
        b.title.toLowerCase().includes(filters.title.toLowerCase()) &&
        b.author.toLowerCase().includes(filters.author.toLowerCase()) &&
        b.category.toLowerCase().includes(filters.category.toLowerCase())
    );

    data.sort((a, b) => {
      const aVal = a[sort.field];
      const bVal = b[sort.field];

      if (typeof aVal === "string") {
        return sort.direction === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sort.direction === "asc" ? aVal - bVal : bVal - aVal;
    });

    return data;
  }, [books, filters, sort]);

  // ================= PAGINATION =================
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    fetchBooks(page);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <ToastContainer />

      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        📚 Library Book Management
      </h1>

      {/* ================= FORM ================= */}
      <form
        onSubmit={saveBook}
        className="bg-white shadow rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
      >
        {[
          ["Book Title", "title"],
          ["Author", "author"],
          ["ISBN", "isbn"],
          ["Category", "category"],
        ].map(([label, key]) => (
          <div key={key}>
            <label className="block text-sm font-semibold mb-1">{label}</label>
            <input
              className="w-full border rounded-lg p-2"
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              required={key !== "isbn" && key !== "category"}
            />
          </div>
        ))}

        <div>
          <label className="block text-sm font-semibold mb-1">Published Year</label>
          <input
            type="number"
            className="w-full border rounded-lg p-2"
            value={form.publishedYear}
            onChange={(e) => setForm({ ...form, publishedYear: +e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Total Copies</label>
          <input
            type="number"
            className="w-full border rounded-lg p-2"
            value={form.totalCopies}
            onChange={(e) => setForm({ ...form, totalCopies: +e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Copies Available</label>
          <input
            type="number"
            className="w-full border rounded-lg p-2"
            value={form.copiesAvailable}
            onChange={(e) => setForm({ ...form, copiesAvailable: +e.target.value })}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold mb-1">Description</label>
          <textarea
            className="w-full border rounded-lg p-2"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <button
          className={`md:col-span-2 py-2 rounded-lg text-white font-semibold ${
            isEditing ? "bg-yellow-500" : "bg-blue-600"
          }`}
        >
          {isEditing ? "Update Book" : "Add Book"}
        </button>
      </form>

      {/* ================= TABLE ================= */}
      <div className="overflow-x-auto bg-white shadow rounded-xl">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              {[
                "Title",
                "Author",
                "ISBN",
                "Category",
                "Year",
                "Total",
                "Available",
                "Description",
                "Actions",
              ].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedBooks.length === 0 && (
              <tr>
                <td colSpan="9" className="text-center py-6 text-gray-500">
                  No books found
                </td>
              </tr>
            )}

            {filteredAndSortedBooks.map((b) => (
              <tr key={b.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">{b.title}</td>
                <td className="px-4 py-3">{b.author}</td>
                <td className="px-4 py-3">{b.isbn}</td>
                <td className="px-4 py-3">{b.category}</td>
                <td className="px-4 py-3">{b.publishedYear}</td>
                <td className="px-4 py-3">{b.totalCopies}</td>
                <td className="px-4 py-3">{b.copiesAvailable}</td>
                <td className="px-4 py-3 truncate max-w-xs">{b.description}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button
                    onClick={() => editBook(b)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteBook(b.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= PAGINATION ================= */}
      <div className="flex justify-center gap-2 mt-6">
        <button
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
          className="px-4 py-1 bg-gray-300 rounded disabled:opacity-50"
        >
          Prev
        </button>

        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => handlePageChange(i + 1)}
            className={`px-4 py-1 rounded ${
              currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
          className="px-4 py-1 bg-gray-300 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
