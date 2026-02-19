import React, { useEffect, useState } from "react";
import { studentService } from "../../services/studentService";
import toast from "react-hot-toast";

const StudentFees = () => {
  const [summary, setSummary] = useState(null);
  const [ledgers, setLedgers] = useState([]);

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      const res = await studentService.getFees();
      setSummary(res.data.data.summary);
      setLedgers(res.data.data.ledgers);
    } catch (err) {
      toast.error("Failed to fetch fees");
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">My Fees</h1>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-green-50 p-6 rounded-xl">
          <p className="text-sm text-gray-600">Total Paid</p>
          <p className="text-2xl font-bold text-green-600">
            ₹{summary?.totalPaid || 0}
          </p>
        </div>

        <div className="bg-red-50 p-6 rounded-xl">
          <p className="text-sm text-gray-600">Total Pending</p>
          <p className="text-2xl font-bold text-red-600">
            ₹{summary?.totalPending || 0}
          </p>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4">Month</th>
              <th className="p-4">Total</th>
              <th className="p-4">Paid</th>
              <th className="p-4">Balance</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>

          <tbody>
            {ledgers.map((l) => (
              <tr key={l._id} className="border-t">
                <td className="p-4">
                  {l.month}/{l.year}
                </td>
                <td className="p-4">₹{l.totalAmount}</td>
                <td className="p-4 text-green-600">
                  ₹{l.paidAmount}
                </td>
                <td className="p-4 text-red-600">
                  ₹{l.balance}
                </td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      l.status === "paid"
                        ? "bg-green-100 text-green-700"
                        : l.status === "partial"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {l.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentFees;
