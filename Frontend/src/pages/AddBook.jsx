import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

const BASE_URL = "https://localhost:8081/api/books";

export default function AddBook() {
  const [form, setForm] = useState({
    title: "",
    author: "",
    isbn: "",
    category: "",
    publishedYear: new Date().getFullYear(),
    description: "",
    totalCopies: 1,
    copiesAvailable: 1,
  });

  const navigate = useNavigate();

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) return {};
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const saveBook = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${BASE_URL}/addbook`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error();

      toast.success("Book added successfully");
      setTimeout(() => navigate("/books"), 1000);
    } catch {
      toast.error("Admin permission required");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-xl">
      <ToastContainer />

      <h2 className="text-2xl font-bold mb-4">➕ Add New Book</h2>

      <form onSubmit={saveBook} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {["title", "author", "isbn", "category"].map((f) => (
          <div key={f}>
            <label className="block text-sm font-semibold mb-1 capitalize">
              {f}
            </label>
            <input
              className="w-full border rounded-lg p-2"
              value={form[f]}
              onChange={(e) =>
                setForm({ ...form, [f]: e.target.value })
              }
              required
            />
          </div>
        ))}

        <div>
          <label className="block text-sm font-semibold mb-1">
            Published Year
          </label>
          <input
            type="number"
            className="w-full border rounded-lg p-2"
            value={form.publishedYear}
            onChange={(e) =>
              setForm({ ...form, publishedYear: +e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">
            Total Copies
          </label>
          <input
            type="number"
            className="w-full border rounded-lg p-2"
            value={form.totalCopies}
            onChange={(e) =>
              setForm({ ...form, totalCopies: +e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">
            Available Copies
          </label>
          <input
            type="number"
            className="w-full border rounded-lg p-2"
            value={form.copiesAvailable}
            onChange={(e) =>
              setForm({ ...form, copiesAvailable: +e.target.value })
            }
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold mb-1">
            Description
          </label>
          <textarea
            className="w-full border rounded-lg p-2"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />
        </div>

        <button
          type="submit"
          className="md:col-span-2 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
        >
          Save Book
        </button>
      </form>
    </div>
  );
}
