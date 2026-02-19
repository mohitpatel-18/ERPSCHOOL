import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { adminService } from "../../services/adminService";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import {
  FaCalendarAlt,
  FaUserShield,
  FaCheckCircle,
  FaToggleOn,
  FaToggleOff
} from "react-icons/fa";

const AdminProfile = () => {
  const { user } = useAuth();

  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetchYears();
  }, []);

  const fetchYears = async () => {
    try {
      const res = await adminService.getAcademicYears();
      setAcademicYears(res.data.data);
    } catch {
      toast.error("Failed to load academic years");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.startDate || !formData.endDate) {
      return toast.error("All fields are required");
    }

    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      return toast.error("End date must be after start date");
    }

    setLoading(true);

    try {
      await adminService.createAcademicYear({
        name: formData.name,
        startDate: formData.startDate,
        endDate: formData.endDate,
      });

      toast.success("Academic Year Created Successfully 🚀");

      setFormData({
        name: "",
        startDate: "",
        endDate: "",
      });

      fetchYears();
    } catch (err) {
      toast.error(err.response?.data?.message || "Creation failed");
    } finally {
      setLoading(false);
    }
  };

  const toggleYear = async (id) => {
    await adminService.toggleAcademicYear(id);
    fetchYears();
  };

  return (
    <div className="space-y-10">

      {/* HEADER */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-3xl font-bold text-gray-800">
          Admin Profile & Settings
        </h1>
        <p className="text-gray-500">
          Manage system configuration and academic sessions
        </p>
      </motion.div>

      {/* ADMIN INFO CARD */}
      <div className="bg-white p-6 rounded-2xl shadow-md flex items-center gap-6">
        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
          <FaUserShield className="text-3xl text-indigo-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">{user?.name}</h2>
          <p className="text-gray-500">{user?.email}</p>
          <p className="text-sm text-green-600 font-medium mt-1">
            Super Admin Access
          </p>
        </div>
      </div>

      {/* ACADEMIC YEAR SECTION */}
      <div className="bg-white p-8 rounded-2xl shadow-lg space-y-8">

        <div className="flex items-center gap-3">
          <FaCalendarAlt className="text-xl text-indigo-600" />
          <h2 className="text-xl font-semibold">
            Academic Year Management
          </h2>
        </div>

        {/* CREATE FORM */}
        <form
          onSubmit={handleCreate}
          className="grid md:grid-cols-4 gap-6"
        >
          <input
            type="text"
            placeholder="e.g. 2025-26"
            className="input-field"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
          />

          <input
            type="date"
            className="input-field"
            value={formData.startDate}
            onChange={(e) =>
              setFormData({ ...formData, startDate: e.target.value })
            }
          />

          <input
            type="date"
            className="input-field"
            value={formData.endDate}
            onChange={(e) =>
              setFormData({ ...formData, endDate: e.target.value })
            }
          />

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </form>

        {/* YEARS LIST */}
        <div className="space-y-4">
          {academicYears.map((year) => (
            <div
              key={year._id}
              className="flex justify-between items-center p-5 border rounded-xl hover:shadow-sm transition"
            >
              <div>
                <h3 className="font-semibold text-lg">
                  {year.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {new Date(year.startDate).toLocaleDateString()} —{" "}
                  {new Date(year.endDate).toLocaleDateString()}
                </p>
                {year.isActive && (
                  <span className="inline-flex items-center gap-1 text-green-600 text-xs mt-1">
                    <FaCheckCircle /> Active
                  </span>
                )}
              </div>

              <button
                onClick={() => toggleYear(year._id)}
                className="text-xl text-indigo-600 hover:scale-110 transition"
              >
                {year.isActive ? <FaToggleOn /> : <FaToggleOff />}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
