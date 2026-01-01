import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FiPlus,
  FiTrash2,
  FiEdit,
  FiSave,
  FiUpload,
  FiSearch,
} from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

/* ================= CONFIG ================= */
const BASE_URL = import.meta.env.VITE_BACKEND_URL + "/materials";
const CATEGORIES = ["BOOK", "COMPUTER","MAGAZINE", "OTHER"];

/* ================= COMPONENT ================= */
export default function Material() {
  const token = localStorage.getItem("token");
  const role = (localStorage.getItem("role") || "USER")
    .replace("ROLE_", "")
    .toUpperCase();

  const canEdit = role === "ADMIN" || role === "LIBRARIAN";
  const canDelete = role === "ADMIN";

  const [materials, setMaterials] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [borrow, setBorrow] = useState("ALL");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    material: "BOOK",
    quantity: 0,
    location: "",
    borrowable: false,
    description: "",
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const PER_PAGE = 6;

  /* ---------- LOAD MATERIALS ---------- */
  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      const res = await axios.get(BASE_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMaterials(res.data);
    } catch (err) {
      toast.error("Failed to load materials");
    }
  };

  /* ---------- FILTER ---------- */
  const filtered = useMemo(() => {
    return materials.filter((m) => {
      const s = m.name.toLowerCase().includes(search.toLowerCase());
      const c = category === "ALL" || m.material === category;
      const b =
        borrow === "ALL" ||
        (borrow === "YES" && m.borrowable) ||
        (borrow === "NO" && !m.borrowable);
      return s && c && b;
    });
  }, [materials, search, category, borrow]);

  const pages = Math.ceil(filtered.length / PER_PAGE);
  const data = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  /* ---------- IMAGE ---------- */
  const handleImage = (file) => {
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  /* ---------- ADD MATERIAL ---------- */
  const addMaterial = async () => {
    if (!form.name) return toast.error("Name required");

    const optimistic = { ...form, id: Date.now(), image: preview };
    setMaterials((prev) => [optimistic, ...prev]);

    try {
      const fd = new FormData();
      fd.append("material", new Blob([JSON.stringify(form)], { type: "application/json" }));
      if (image) fd.append("imageFile", image);

      await axios.post(BASE_URL, fd, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Material added");
      loadMaterials();
      setForm({
        name: "",
        material: "BOOK",
        quantity: 0,
        location: "",
        borrowable: false,
        description: "",
      });
      setPreview(null);
      setImage(null);
    } catch (err) {
      console.log(err.response?.data || err.message);
      toast.error("Failed to add material");
      loadMaterials();
    }
  };

  /* ---------- UPDATE MATERIAL ---------- */
  const saveInline = async (m) => {
    const backup = materials;
    setEditingId(null);

    try {
      const fd = new FormData();
      fd.append("material", new Blob([JSON.stringify(m)], { type: "application/json" }));
      if (m.newImageFile) fd.append("imageFile", m.newImageFile);

      await axios.put(`${BASE_URL}/${m.id}`, fd, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Updated");
      loadMaterials();
    } catch (err) {
      console.log(err.response?.data || err.message);
      toast.error("Update failed");
      setMaterials(backup);
    }
  };

  /* ---------- DELETE MATERIAL ---------- */
  const remove = async (id) => {
    const backup = materials;
    setMaterials((prev) => prev.filter((m) => m.id !== id));

    try {
      await axios.delete(`${BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Deleted");
    } catch {
      toast.error("Delete failed");
      setMaterials(backup);
    }
  };

  /* ---------- CHART DATA ---------- */
  const chartData = {
    labels: ["Borrowable", "Not Borrowable"],
    datasets: [
      {
        data: [
          materials.filter((m) => m.borrowable).length,
          materials.filter((m) => !m.borrowable).length,
        ],
        backgroundColor: ["#3b82f6", "#94a3b8"],
        borderRadius: 6,
        barThickness: 40,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 space-y-8 text-slate-900">
      <ToastContainer position="bottom-right" />

      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-800">Inventory <span className="text-indigo-600">Store</span></h1>
          <p className="text-slate-500 font-medium">Manage and track company assets</p>
        </div>
        <div className="text-right">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Logged in as</span>
            <p className="text-blue-600 font-bold">{role}</p>
        </div>
      </div>

      {/* DASHBOARD */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* STATS + CHART */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Stat label="Total Assets" value={materials.length} />
            <Stat
              label="Available Now"
              value={materials.filter((m) => m.borrowable).length}
            />
          </div>

          <div className="h-48">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Stock Distribution</h3>
            <Bar
              data={chartData}
              options={{
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { display: false }, x: { grid: { display: false } } }
              }}
            />
          </div>
        </div>

        {/* QUICK ADD */}
        {canEdit && (
          <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-100 space-y-4">
            <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                <FiPlus className="text-blue-600" /> Quick Add
            </h3>

            {/* IMAGE UPLOAD */}
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-4 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all group">
              {preview ? (
                <img
                  src={preview}
                  className="w-20 h-20 rounded-xl object-cover shadow-md"
                />
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-blue-100 transition-colors">
                    <FiUpload className="text-slate-400 group-hover:text-blue-600" />
                  </div>
                  <span className="text-xs font-bold text-slate-400 group-hover:text-blue-600">Upload Image</span>
                </div>
              )}
              <input
                hidden
                type="file"
                onChange={(e) => handleImage(e.target.files[0])}
              />
            </label>

            <div className="grid gap-3">
                <input
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                />

                <div className="grid grid-cols-2 gap-3">
                    <select
                    className="p-2 rounded-xl border border-slate-200 outline-none"
                    value={form.material}
                    onChange={(e) => setForm({ ...form, material: e.target.value })}
                    >
                    {CATEGORIES.map((c) => (
                        <option key={c}>{c}</option>
                    ))}
                    </select>

                    <input
                    type="number"
                    className="p-2 rounded-xl border border-slate-200 outline-none"
                    placeholder="Qty"
                    value={form.quantity ?? ""}
                    onChange={(e) =>
                        setForm({
                        ...form,
                        quantity:
                            e.target.value === "" ? 0 : parseInt(e.target.value),
                        })
                    }
                    />
                </div>

                <input
                className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none"
                placeholder="Location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                />

                <input
                className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none"
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                }
                />

                <label className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl cursor-pointer">
                <input
                    type="checkbox"
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    checked={form.borrowable}
                    onChange={(e) =>
                    setForm({ ...form, borrowable: e.target.checked })
                    }
                />
                <span className="text-sm font-semibold text-slate-600">Borrowable Asset</span>
                </label>

                <button
                onClick={addMaterial}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 transition-all transform active:scale-95"
                >
                Create Material
                </button>
            </div>
          </div>
        )}
      </div>

      {/* FILTERS */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-grow w-full">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="pl-12 pr-4 py-3 w-full rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            placeholder="Search material inventory..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
            <select
            className="p-3 bg-slate-50 rounded-xl border-none font-semibold text-slate-600 outline-none"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            >
            <option value="ALL">All Categories</option>
            {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
            ))}
            </select>

            <select
            className="p-3 bg-slate-50 rounded-xl border-none font-semibold text-slate-600 outline-none"
            value={borrow}
            onChange={(e) => setBorrow(e.target.value)}
            >
            <option value="ALL">All Status</option>
            <option value="YES">Borrowable</option>
            <option value="NO">Not Borrowable</option>
            </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 w-12"></th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Item</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Category</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Description</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Qty</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="p-4">
                  <input
                    type="checkbox"
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    checked={selected.includes(m.id)}
                    onChange={() =>
                      setSelected((s) =>
                        s.includes(m.id)
                          ? s.filter((x) => x !== m.id)
                          : [...s, m.id]
                      )
                    }
                  />
                </td>

                <td className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200">
                      {m.image ? (
                        <img
                          src={`https://localhost:8081/uploads/${m.image}`}
                          alt={m.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-300 font-bold uppercase p-1 text-center">No image</div>
                      )}
                    </div>
                    <div>
                        {editingId === m.id ? (
                            <input
                            className="px-2 py-1 border rounded bg-white shadow-inner"
                            value={m.name}
                            onChange={(e) =>
                                setMaterials((prev) =>
                                prev.map((x) =>
                                    x.id === m.id ? { ...x, name: e.target.value } : x
                                )
                                )
                            }
                            />
                        ) : (
                            <p className="font-bold text-slate-700">{m.name}</p>
                        )}
                        <p className="text-xs text-slate-400">{m.location}</p>
                    </div>
                  </div>
                </td>

                <td className="p-4 text-sm font-semibold text-slate-500 uppercase tracking-tighter">{m.material}</td>
                <td className="p-4 text-sm text-slate-600 truncate max-w-xs">{m.description}</td>
                <td className="p-4 text-center font-bold text-slate-700">{m.quantity}</td>
                <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${m.borrowable ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                        {m.borrowable ? "Borrowable" : "Internal"}
                    </span>
                </td>

                <td className="p-4">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {canEdit &&
                      (editingId === m.id ? (
                        <button onClick={() => saveInline(m)} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                          <FiSave />
                        </button>
                      ) : (
                        <button onClick={() => setEditingId(m.id)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                          <FiEdit />
                        </button>
                      ))}
                    {canDelete && (
                      <button onClick={() => remove(m.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <FiTrash2 />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && (
            <div className="p-12 text-center text-slate-400 font-medium italic">No items found matching your search</div>
        )}
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center gap-2 pb-8">
        {[...Array(pages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`w-10 h-10 rounded-xl font-bold transition-all ${
              page === i + 1
                ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                : "bg-white text-slate-400 border border-slate-200 hover:border-blue-400"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ================= SMALL STAT ================= */
const Stat = ({ label, value }) => (
  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-3xl font-black text-blue-600 leading-none">{value}</p>
  </div>
);