import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { adminService } from "../../services/adminService";
import { classService } from "../../services/classService";
import toast from "react-hot-toast";
import { FaCalendarAlt, FaLayerGroup } from "react-icons/fa";

const GenerateLedger = () => {
  const [classes, setClasses] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    classId: "",
    academicYearId: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    fetchClasses();
    fetchAcademicYears();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await classService.getAllClasses();
      const classList =
        res.data?.data?.data || res.data?.data || [];
      setClasses(Array.isArray(classList) ? classList : []);
    } catch (err) {
      toast.error("Failed to load classes");
      setClasses([]);
    }
  };

  const fetchAcademicYears = async () => {
    try {
      const res = await adminService.getAcademicYears();
      const years =
        res.data?.data?.data || res.data?.data || [];
      setAcademicYears(Array.isArray(years) ? years : []);
    } catch {
      setAcademicYears([]);
    }
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.classId || !formData.academicYearId) {
      return toast.error("Class & Academic Year required");
    }

    setLoading(true);

    try {
      const res = await adminService.generateLedger({
        classId: formData.classId,
        academicYearId: formData.academicYearId,
        month: formData.month,
        year: formData.year,
      });

      toast.success(
        res.data?.message || "Ledger generated successfully 🚀"
      );
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Ledger generation failed"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-800">
          Generate Monthly Ledger
        </h1>
        <p className="text-gray-500">
          Generate fee ledger automatically for all students in selected class
        </p>
      </motion.div>

      {/* FORM CARD */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white p-10 rounded-2xl shadow-xl space-y-8"
      >
        <div className="grid md:grid-cols-2 gap-8">
          {/* CLASS */}
          <div>
            <label className="text-sm font-medium flex items-center gap-2">
              <FaLayerGroup /> Select Class
            </label>
            <select
              className="input-field mt-2"
              value={formData.classId}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  classId: e.target.value,
                })
              }
            >
              <option value="">Choose Class</option>
              {Array.isArray(classes) &&
                classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name} {cls.section}
                  </option>
                ))}
            </select>
          </div>

          {/* ACADEMIC YEAR */}
          <div>
            <label className="text-sm font-medium flex items-center gap-2">
              <FaCalendarAlt /> Academic Year
            </label>
            <select
              className="input-field mt-2"
              value={formData.academicYearId}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  academicYearId: e.target.value,
                })
              }
            >
              <option value="">Choose Academic Year</option>
              {Array.isArray(academicYears) &&
                academicYears.map((year) => (
                  <option key={year._id} value={year._id}>
                    {year.name}
                    {year.isActive ? " (Active)" : ""}
                  </option>
                ))}
            </select>
          </div>

          {/* MONTH */}
          <div>
            <label className="text-sm font-medium">Month</label>
            <select
              className="input-field mt-2"
              value={formData.month}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  month: Number(e.target.value),
                })
              }
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString("default", {
                    month: "long",
                  })}
                </option>
              ))}
            </select>
          </div>

          {/* YEAR */}
          <div>
            <label className="text-sm font-medium">Year</label>
            <input
              type="number"
              className="input-field mt-2"
              value={formData.year}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  year: Number(e.target.value),
                })
              }
            />
          </div>
        </div>

        {/* INFO BOX */}
        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg text-sm text-indigo-700">
          ⚠ This will generate ledger entries for all active students in the selected class.
          Duplicate ledgers for same month will not be created.
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full text-lg"
        >
          {loading ? "Generating Ledger..." : "Generate Ledger"}
        </button>
      </motion.form>
    </div>
  );
};

export default GenerateLedger;
