import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL + "/digital-materials";

const DigitalMaterial = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);

  // ================= AUTH =================
  const token = localStorage.getItem("token");
  const rawRole = localStorage.getItem("role") || "USER";
  const role = rawRole.replace("ROLE_", ""); // ADMIN | USER
  const authHeaders = { Authorization: `Bearer ${token}` };

  // ================= FORM STATE =================
  const [form, setForm] = useState({
    title: "",
    description: "",
    readable: false,
    downloadable: true,
    file: null,
  });

  // ================= FILTER STATE =================
  const [searchTitle, setSearchTitle] = useState("");
  const [fileType, setFileType] = useState("ALL");

  // ================= FETCH MATERIALS =================
  const fetchMaterials = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/getAll`, { headers: authHeaders });
      setMaterials(res.data);
    } catch (err) {
      console.error("Fetch error", err);
      alert("Failed to fetch materials");
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  // ================= FILTER LOGIC =================
  const filteredMaterials = materials.filter((m) => {
    const matchesTitle = m.title.toLowerCase().includes(searchTitle.toLowerCase());
    const extension = m.fileName?.split(".").pop().toUpperCase();
    const matchesType = fileType === "ALL" || extension === fileType;
    return matchesTitle && matchesType;
  });

  // ================= FORM HANDLERS =================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleFileChange = (e) => setForm({ ...form, file: e.target.files[0] });

  // ================= UPLOAD =================
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!form.title || !form.file) return alert("Title and file are required");

    const formData = new FormData();
    formData.append("file", form.file);
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("readable", form.readable);
    formData.append("downloadable", form.downloadable);

    try {
      setLoading(true);
      await axios.post(`${BASE_URL}/upload`, formData, {
        headers: { ...authHeaders, "Content-Type": "multipart/form-data" },
      });

      setForm({ title: "", description: "", readable: false, downloadable: true, file: null });
      fetchMaterials();
    } catch (err) {
      console.error("Upload error", err);
      alert("Upload failed (ADMIN only)");
    } finally {
      setLoading(false);
    }
  };

  // ================= VIEW =================
  const handleView = (id) => window.open(`${BASE_URL}/view/${id}`, "_blank");

  // ================= DOWNLOAD =================
  const handleDownload = async (id, fileName) => {
    try {
      const res = await axios.get(`${BASE_URL}/download/${id}`, {
        headers: authHeaders,
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Download not allowed");
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this material?")) return;
    try {
      await axios.delete(`${BASE_URL}/delete/${id}`, { headers: authHeaders });
      fetchMaterials();
    } catch (err) {
      console.error("Delete error", err);
      alert("Delete failed (ADMIN only)");
    }
  };

  // ================= FILE TYPE COLORS =================
  const fileTypeColors = {
    PDF: "bg-red-100 text-red-700",
    DOCX: "bg-blue-100 text-blue-700",
    PPTX: "bg-orange-100 text-orange-700",
    XLSX: "bg-green-100 text-green-700",
    TXT: "bg-gray-100 text-gray-700",
    DEFAULT: "bg-gray-100 text-gray-700",
  };

  const getFileTypeClass = (ext) => fileTypeColors[ext] || fileTypeColors.DEFAULT;

  // ================= UI =================
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Digital <span className="text-indigo-600">Materials</span>
            </h2>
            <p className="mt-1 text-sm text-gray-500">Access and manage university digital resources.</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
            Role: {role}
          </span>
        </div>

        {/* FILTERS */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Filter by title..."
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            className="md:w-1/3 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <select
            value={fileType}
            onChange={(e) => setFileType(e.target.value)}
            className="md:w-1/4 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="ALL">All File Types</option>
            <option value="PDF">PDF</option>
            <option value="DOCX">DOCX</option>
            <option value="PPTX">PPTX</option>
            <option value="XLSX">XLSX</option>
            <option value="TXT">TXT</option>
          </select>
        </div>

        {/* ADMIN UPLOAD */}
        {role === "ADMIN" && (
          <form onSubmit={handleUpload} className="bg-white border border-gray-200 p-8 mb-10 rounded-2xl shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center gap-2 mb-6 border-b pb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800">Upload New Material</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                name="title"
                placeholder="Document Title"
                value={form.title}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer border border-gray-300 rounded-xl p-1"
              />
            </div>

            <textarea
              name="description"
              placeholder="Provide a short description of the material..."
              value={form.description}
              onChange={handleChange}
              rows="3"
              className="w-full p-3 mb-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" name="readable" checked={form.readable} onChange={handleChange} className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">Readable (Online View)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" name="downloadable" checked={form.downloadable} onChange={handleChange} className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">Downloadable</span>
                </label>
              </div>
              <button type="submit" disabled={loading} className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-10 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50">
                {loading ? "Processing..." : "Publish Material"}
              </button>
            </div>
          </form>
        )}

        {/* TABLE */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Size</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredMaterials.map((m) => {
                  const extension = m.fileName?.split(".").pop().toUpperCase();
                  const typeClass = getFileTypeClass(extension);
                  return (
                    <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-800">{m.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{m.description}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-center font-mono">{(m.fileSize / 1024).toFixed(2)} KB</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col gap-1 items-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${m.readable ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>{m.readable ? "👁 Read" : "No Read"}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${m.downloadable ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>{m.downloadable ? "⬇ Down" : "No Down"}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${typeClass}`}>📄 {extension}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          {m.readable && <button onClick={() => handleView(m.id)} className="bg-white border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-all">View</button>}
                          {m.downloadable && <button onClick={() => handleDownload(m.id, m.fileName)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm transition-all">Download</button>}
                          {role === "ADMIN" && <button onClick={() => handleDelete(m.id)} className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-all">Delete</button>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredMaterials.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-gray-400">No digital materials found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DigitalMaterial;
