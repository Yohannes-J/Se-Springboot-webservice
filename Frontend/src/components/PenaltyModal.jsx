import { useState } from "react";
import { toast } from "react-toastify";
import { X, AlertTriangle } from "lucide-react";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export default function PenaltyModal({ record, onClose, onSave }) {
  const [formData, setFormData] = useState({
    brokenPages: record.brokenPages || 0,
    latePenalty: record.latePenalty || 0,
    lost: record.lost || false,
    lostPrice: record.lostPrice || 0,
    status: record.status || false,
  });

  const token = localStorage.getItem("token");
  const authHeaders = () => (token ? { Authorization: `Bearer ${token}` } : {});

  const calculateTotalPenalty = () => {
    const pagePenalty = formData.brokenPages * 0.5;
    const total = pagePenalty + formData.latePenalty + (formData.lost ? formData.lostPrice : 0);
    return total.toFixed(2);
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch(`${BASE_URL}/borrow/penalty/${record.id}`, {
        method: "PUT",
        headers: {
          ...authHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to update penalty");

      const updatedRecord = await res.json();
      toast.success("Penalty updated successfully!");
      onSave(updatedRecord);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update penalty!");
    }
  };

  const calculateDaysOverdue = () => {
    if (!record.returnDate || record.returned) return 0;
    const dueDate = new Date(record.returnDate);
    const today = new Date();
    const diffTime = today.getTime() - dueDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysOverdue = calculateDaysOverdue();
  const suggestedLatePenalty = daysOverdue * 1.0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-t-3xl flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <AlertTriangle className="h-6 w-6" />
              Penalty Management
            </h3>
            <p className="text-sm mt-1 opacity-90">Borrow Record #{record.id}</p>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase">Customer</span>
                <div className="text-lg font-semibold text-gray-900">{record.customer?.name}</div>
              </div>
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase">Book</span>
                <div className="text-lg font-semibold text-gray-900">{record.book?.title}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase">Due Date</span>
                <div className="text-sm text-gray-700">
                  {record.returnDate ? new Date(record.returnDate).toLocaleDateString() : "N/A"}
                </div>
              </div>
              {daysOverdue > 0 && (
                <div>
                  <span className="text-xs font-bold text-red-500 uppercase">Days Overdue</span>
                  <div className="text-sm font-bold text-red-600">{daysOverdue} days</div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-2 flex items-center gap-2">
                Broken Pages
                <span className="text-xs text-gray-400 font-normal">(ETB 0.50 per page)</span>
              </label>
              <input
                type="number"
                min="0"
                value={formData.brokenPages}
                onChange={(e) => setFormData({ ...formData, brokenPages: Number(e.target.value) })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-orange-500 transition"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 block mb-2 flex items-center justify-between">
                <span>Late Return Penalty (ETB)</span>
                {daysOverdue > 0 && (
                  <button
                    onClick={() => setFormData({ ...formData, latePenalty: suggestedLatePenalty })}
                    className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-200 transition"
                  >
                    Suggest: ETB {suggestedLatePenalty.toFixed(2)}
                  </button>
                )}
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.latePenalty}
                onChange={(e) => setFormData({ ...formData, latePenalty: Number(e.target.value) })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-orange-500 transition"
              />
            </div>

            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-bold text-red-700 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.lost}
                    onChange={(e) => setFormData({ ...formData, lost: e.target.checked })}
                    className="w-5 h-5 rounded"
                  />
                  Book Lost/Damaged Beyond Repair
                </label>
              </div>
              {formData.lost && (
                <div>
                  <label className="text-sm font-bold text-red-700 block mb-2">
                    Replacement Cost (ETB)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.lostPrice}
                    onChange={(e) => setFormData({ ...formData, lostPrice: Number(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-red-300 rounded-xl outline-none focus:border-red-500 transition"
                    placeholder="Enter book's replacement cost"
                  />
                </div>
              )}
            </div>

            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
                <span className="text-sm font-bold text-green-700">Mark as Resolved/Paid</span>
              </label>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border-2 border-orange-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-orange-600 text-3xl font-extrabold">ETB</span>
                <div>
                  <div className="text-xs font-bold text-gray-600 uppercase">Total Penalty</div>
                  <div className="text-3xl font-extrabold text-orange-600">
                    {calculateTotalPenalty()}
                  </div>
                </div>
              </div>
              {formData.status && (
                <span className="bg-green-500 text-white px-4 py-2 rounded-full text-xs font-bold">
                  PAID
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-red-600 transition shadow-lg"
            >
              Save Penalty
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
