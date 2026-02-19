import React, { useState } from "react";
import { teacherService } from "../../services/teacherService";
import toast from "react-hot-toast";

const ApplyLeave = () => {
  const [form, setForm] = useState({
    leaveType: "Sick",
    fromDate: "",
    toDate: "",
    reason: "",
    attachment: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "attachment") {
      setForm({ ...form, attachment: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      Object.keys(form).forEach((key) => {
        if (form[key]) {
          formData.append(key, form[key]);
        }
      });

      await teacherService.applyLeave(formData);

      toast.success("Leave request submitted");
    } catch {
      toast.error("Failed to apply leave");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-6">Apply Leave</h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        <select
          name="leaveType"
          value={form.leaveType}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option value="Sick">Sick</option>
          <option value="Casual">Casual</option>
          <option value="Emergency">Emergency</option>
          <option value="Other">Other</option>
        </select>

        <input
          type="date"
          name="fromDate"
          required
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <input
          type="date"
          name="toDate"
          required
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <textarea
          name="reason"
          placeholder="Reason"
          required
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <input
          type="file"
          name="attachment"
          accept="image/*,.pdf"
          onChange={handleChange}
          className="w-full"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Submit Request
        </button>
      </form>
    </div>
  );
};

export default ApplyLeave;
