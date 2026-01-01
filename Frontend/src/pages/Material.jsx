import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FiPlus,
  FiTrash2,
  FiEdit,
  FiSave,
  FiUpload,
  FiSearch,
  FiFile,
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

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

/* ================= CONFIG ================= */
const BASE_URL = import.meta.env.VITE_BACKEND_URL + "/materials";
const CATEGORIES = ["BOOK", "COMPUTER", "TABLE", "CHAIR", "OTHER"];
const PER_PAGE = 6;

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
      fd.append(
        "material",
        new Blob([JSON.stringify(form)], { type: "application/json" })
      );
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
      fd.append(
        "material",
        new Blob([JSON.stringify(m)], { type: "application/json" })
      );
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

  /* ---------- EXPORT EXCEL ---------- */
  const exportExcel = () => {
    if (!selected.length) return toast.error("Select at least one material");

    const exportData = materials
      .filter((m) => selected.includes(m.id))
      .map((m) => ({
        Name: m.name,
        Category: m.material,
        Quantity: m.quantity,
        Location: m.location,
        Borrowable: m.borrowable ? "Yes" : "No",
        Description: m.description,
      }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Materials");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const dataBlob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(dataBlob, "materials.xlsx");
  };

  /* ---------- SELECT ALL ---------- */
  const toggleSelectAll = () => {
    if (selected.length === data.length) setSelected([]);
    else setSelected(data.map((m) => m.id));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 space-y-8 text-slate-900">
      <ToastContainer position="bottom-right" />

      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-800">
            Inventory <span className="text-indigo-600">Store</span>
          </h1>
          <p className="text-slate-500 font-medium">
            Manage and track company assets
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Logged in as
          </span>
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
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
              Stock Distribution
            </h3>
            <Bar
              data={chartData}
              options={{
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { display: false }, x: { grid: { display: false } } },
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
                  <span className="text-xs font-bold text-slate-400 group-hover:text-blue-600">
                    Upload Image
                  </span>
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
                  onChange={(e) =>
                    setForm({ ...form, material: e.target.value })
                  }
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
                <span className="text-sm font-semibold text-slate-600">
                  Borrowable Asset
                </span>
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

      {/* EXPORT + FILTERS */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <button
            onClick={exportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md"
          >
            <FiFile /> Export Selected
          </button>
        </div>
      </div>

      {/* TABLE + PAGINATION */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 w-12">
                <input
                  type="checkbox"
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  checked={selected.length === data.length && data.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
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

                <td className="p-4 flex items-center gap-4">
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
                  <div className="flex flex-col flex-1">
                    {editingId === m.id ? (
                      <>
                        <input
                          className="px-2 py-1 border rounded mb-1"
                          value={m.name}
                          onChange={(e) =>
                            setMaterials((prev) =>
                              prev.map((x) =>
                                x.id === m.id ? { ...x, name: e.target.value } : x
                              )
                            )
                          }
                        />
                        <input
                          className="px-2 py-1 border rounded"
                          value={m.location}
                          onChange={(e) =>
                            setMaterials((prev) =>
                              prev.map((x) =>
                                x.id === m.id ? { ...x, location: e.target.value } : x
                              )
                            )
                          }
                        />
                      </>
                    ) : (
                      <>
                        <p className="font-bold text-slate-700">{m.name}</p>
                        <p className="text-xs text-slate-400">{m.location}</p>
                      </>
                    )}
                  </div>
                </td>

                <td className="p-4">
                  {editingId === m.id ? (
                    <select
                      className="px-2 py-1 border rounded"
                      value={m.material}
                      onChange={(e) =>
                        setMaterials((prev) =>
                          prev.map((x) =>
                            x.id === m.id ? { ...x, material: e.target.value } : x
                          )
                        )
                      }
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-tighter">{m.material}</p>
                  )}
                </td>

                <td className="p-4">
                  {editingId === m.id ? (
                    <input
                      className="px-2 py-1 border rounded w-full"
                      value={m.description}
                      onChange={(e) =>
                        setMaterials((prev) =>
                          prev.map((x) =>
                            x.id === m.id ? { ...x, description: e.target.value } : x
                          )
                        )
                      }
                    />
                  ) : (
                    <p className="text-sm text-slate-500">{m.description}</p>
                  )}
                </td>

                <td className="p-4 text-center">
                  {editingId === m.id ? (
                    <input
                      type="number"
                      className="px-2 py-1 border rounded w-16"
                      value={m.quantity}
                      onChange={(e) =>
                        setMaterials((prev) =>
                          prev.map((x) =>
                            x.id === m.id
                              ? { ...x, quantity: parseInt(e.target.value) }
                              : x
                          )
                        )
                      }
                    />
                  ) : (
                    <p>{m.quantity}</p>
                  )}
                </td>

                <td className="p-4 text-center">
                  {editingId === m.id ? (
                    <input
                      type="checkbox"
                      checked={m.borrowable}
                      onChange={(e) =>
                        setMaterials((prev) =>
                          prev.map((x) =>
                            x.id === m.id
                              ? { ...x, borrowable: e.target.checked }
                              : x
                          )
                        )
                      }
                    />
                  ) : (
                    <span
                      className={`font-bold px-2 py-1 rounded ${
                        m.borrowable ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                      }`}
                    >
                      {m.borrowable ? "Yes" : "No"}
                    </span>
                  )}
                </td>

                <td className="p-4 text-right flex justify-end gap-2">
                  {editingId === m.id ? (
                    <>
                      <button
                        onClick={() => saveInline(m)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <FiSave />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      {canEdit && (
                        <button
                          onClick={() => setEditingId(m.id)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <FiEdit />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => remove(m.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <FiTrash2 />
                        </button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* PAGINATION */}
        <div className="p-4 flex justify-between items-center bg-slate-50">
          <p className="text-sm text-slate-500">
            Page {page} of {pages}
          </p>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 rounded bg-slate-200 hover:bg-slate-300 disabled:opacity-50"
            >
              Prev
            </button>
            <button
              disabled={page === pages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 rounded bg-slate-200 hover:bg-slate-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= STAT COMPONENT ================= */
function Stat({ label, value }) {
  return (
    <div className="bg-slate-50 rounded-2xl p-4 flex flex-col">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
        {label}
      </p>
      <p className="text-2xl font-bold text-slate-700">{value}</p>
    </div>
  );
}
