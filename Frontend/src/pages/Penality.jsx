import React, { useEffect, useState } from "react";
import axios from "axios";

const Penality = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const LATE_FINE_PER_DAY = 5; 
  const BROKEN_PAGE_FINE = 2; 
  const LOST_BOOK_FINE = 50; 

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      try {
        const res = await axios.get("https://localhost:8081/api/borrow/all"); 
        setRecords(res.data);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch borrow records");
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  const calculatePenalty = (record) => {
    const today = new Date();
    const dueDate = new Date(record.dueDate);
    let lateDays = Math.max(0, Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24)));

    const latePenalty = lateDays * LATE_FINE_PER_DAY;
    const brokenPenalty = (record.brokenPages || 0) * BROKEN_PAGE_FINE;
    const lostPenalty = record.lost ? LOST_BOOK_FINE : 0;

    const total = latePenalty + brokenPenalty + lostPenalty;

    return { latePenalty, brokenPenalty, lostPenalty, total };
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Penalty Management</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2">User</th>
              <th className="border px-4 py-2">Book</th>
              <th className="border px-4 py-2">Late ($)</th>
              <th className="border px-4 py-2">Broken Pages ($)</th>
              <th className="border px-4 py-2">Lost Book ($)</th>
              <th className="border px-4 py-2">Total ($)</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => {
              const { latePenalty, brokenPenalty, lostPenalty, total } = calculatePenalty(r);
              return (
                <tr key={r._id}>
                  <td className="border px-4 py-2">{r.user.username}</td>
                  <td className="border px-4 py-2">{r.book.title}</td>
                  <td className="border px-4 py-2">{latePenalty}</td>
                  <td className="border px-4 py-2">{brokenPenalty}</td>
                  <td className="border px-4 py-2">{lostPenalty}</td>
                  <td className="border px-4 py-2 font-bold">{total}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Penality;
