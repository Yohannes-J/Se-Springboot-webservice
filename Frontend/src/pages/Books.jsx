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

      if (!res.ok) {
        if (res.status === 403 || res.status === 401) throw new Error("NO_PERMISSION");
        throw new Error();
      }

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

      if (!res.ok) {
        if (res.status === 403 || res.status === 401) throw new Error("NO_PERMISSION");
        throw new Error();
      }

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

    // FILTER
    data = data.filter(
      (b) =>
        b.title.toLowerCase().includes(filters.title.toLowerCase()) &&
        b.author.toLowerCase().includes(filters.author.toLowerCase()) &&
        b.category.toLowerCase().includes(filters.category.toLowerCase())
    );

    // SORT
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

  // ================= PAGINATION HANDLER =================
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
        className="bg-white shadow-md rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
      >
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-semibold mb-1">
            Book Title
          </label>
          <input
            id="title"
            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>

        {/* Author */}
        <div>
          <label htmlFor="author" className="block text-sm font-semibold mb-1">
            Author
          </label>
          <input
            id="author"
            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
            value={form.author}
            onChange={(e) => setForm({ ...form, author: e.target.value })}
            required
          />
        </div>

        {/* ISBN */}
        <div>
          <label htmlFor="isbn" className="block text-sm font-semibold mb-1">
            ISBN
          </label>
          <input
            id="isbn"
            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
            value={form.isbn}
            onChange={(e) => setForm({ ...form, isbn: e.target.value })}
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-semibold mb-1">
            Category
          </label>
          <input
            id="category"
            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
        </div>

        {/* Published Year */}
        <div>
          <label htmlFor="publishedYear" className="block text-sm font-semibold mb-1">
            Published Year
          </label>
          <input
            id="publishedYear"
            type="number"
            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
            value={form.publishedYear}
            onChange={(e) => setForm({ ...form, publishedYear: +e.target.value })}
          />
        </div>

        {/* Total Copies */}
        <div>
          <label htmlFor="totalCopies" className="block text-sm font-semibold mb-1">
            Total Copies
          </label>
          <input
            id="totalCopies"
            type="number"
            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
            value={form.totalCopies}
            onChange={(e) => setForm({ ...form, totalCopies: +e.target.value })}
          />
        </div>

        {/* Copies Available */}
        <div>
          <label htmlFor="copiesAvailable" className="block text-sm font-semibold mb-1">
            Copies Available
          </label>
          <input
            id="copiesAvailable"
            type="number"
            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
            value={form.copiesAvailable}
            onChange={(e) => setForm({ ...form, copiesAvailable: +e.target.value })}
          />
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-semibold mb-1">
            Description
          </label>
          <textarea
            id="description"
            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        {/* Submit Button */}
        <button
          className={`md:col-span-2 py-2 rounded-lg text-white font-semibold ${
            isEditing ? "bg-yellow-500 hover:bg-yellow-600" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isEditing ? "Update Book" : "Add Book"}
        </button>
      </form>

      {/* ================= FILTER + SORT ================= */}
      <div className="bg-white shadow rounded-xl p-4 mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
        <input
          placeholder="Filter by title"
          className="border rounded-lg p-2"
          value={filters.title}
          onChange={(e) => setFilters({ ...filters, title: e.target.value })}
        />
        <input
          placeholder="Filter by author"
          className="border rounded-lg p-2"
          value={filters.author}
          onChange={(e) => setFilters({ ...filters, author: e.target.value })}
        />
        <input
          placeholder="Filter by category"
          className="border rounded-lg p-2"
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        />
        <select
          className="border rounded-lg p-2"
          value={sort.field}
          onChange={(e) => setSort({ ...sort, field: e.target.value })}
        >
          <option value="title">Sort by Title</option>
          <option value="author">Sort by Author</option>
          <option value="category">Sort by Category</option>
          <option value="publishedYear">Sort by Year</option>
        </select>
        <select
          className="border rounded-lg p-2"
          value={sort.direction}
          onChange={(e) => setSort({ ...sort, direction: e.target.value })}
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      {/* ================= TABLE ================= */}
      <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              {["Title", "Author", "ISBN", "Category", "Year", "Total", "Available", "Actions"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 border-b-2 border-gray-300 text-left font-semibold"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedBooks.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center py-6 text-gray-500">
                  No books found
                </td>
              </tr>
            )}
            {filteredAndSortedBooks.map((b) => (
              <tr
                key={b.id}
                className="border-b border-gray-200 hover:bg-gray-50 transition"
              >
                <td className="px-4 py-3">{b.title}</td>
                <td className="px-4 py-3">{b.author}</td>
                <td className="px-4 py-3">{b.isbn}</td>
                <td className="px-4 py-3">{b.category}</td>
                <td className="px-4 py-3">{b.publishedYear}</td>
                <td className="px-4 py-3">{b.totalCopies}</td>
                <td className="px-4 py-3">{b.copiesAvailable}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button
                    onClick={() => editBook(b)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteBook(b.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
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
          className="px-4 py-1 rounded bg-gray-300 disabled:opacity-50"
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
          className="px-4 py-1 rounded bg-gray-300 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
