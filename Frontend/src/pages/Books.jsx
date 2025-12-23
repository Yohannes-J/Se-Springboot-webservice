import { useEffect, useState, useMemo } from "react";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

const BASE_URL = "https://localhost:8081/api/books";

export default function Books() {
  const [books, setBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 5;

  const [filters, setFilters] = useState({
    title: "",
    author: "",
    category: "",
  });

  const [sort, setSort] = useState({
    field: "title",
    direction: "asc",
  });

  // ================= FETCH BOOKS =================
  const fetchBooks = async (page = 1) => {
    try {
      const res = await fetch(
        `${BASE_URL}/list?page=${page - 1}&size=${pageSize}&sortBy=${sort.field}&sortDir=${sort.direction}`
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

  // ================= FILTER + SORT =================
  const filteredBooks = useMemo(() => {
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

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          📚 Library Books
        </h1>

        <Link
          to="/books/add"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
        >
          ➕ Add Book
        </Link>
      </div>

      {/* FILTERS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {["title", "author", "category"].map((f) => (
          <input
            key={f}
            placeholder={`Filter by ${f}`}
            className="border p-2 rounded"
            value={filters[f]}
            onChange={(e) =>
              setFilters({ ...filters, [f]: e.target.value })
            }
          />
        ))}
      </div>

      {/* TABLE */}
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
              ].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredBooks.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center py-6 text-gray-500">
                  No books found
                </td>
              </tr>
            )}

            {filteredBooks.map((b) => (
              <tr key={b.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">{b.title}</td>
                <td className="px-4 py-3">{b.author}</td>
                <td className="px-4 py-3">{b.isbn}</td>
                <td className="px-4 py-3">{b.category}</td>
                <td className="px-4 py-3">{b.publishedYear}</td>
                <td className="px-4 py-3">{b.totalCopies}</td>
                <td className="px-4 py-3">{b.copiesAvailable}</td>
                <td className="px-4 py-3 truncate max-w-xs">
                  {b.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
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
              currentPage === i + 1
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
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
