import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { adminService } from "../../services/adminService";
import { classService } from "../../services/classService";
import toast from "react-hot-toast";
import { FaPlus, FaTrash } from "react-icons/fa";

const FeeStructure = () => {
  const [classes, setClasses] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    classId: "",
    academicYearId: "",
    lateFinePerDay: 10,
    graceDays: 3,
    components: [{ name: "", amount: "", type: "monthly" }],
  });

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    fetchClasses();
    fetchAcademicYears();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await classService.getAllClasses();
      setClasses(res.data.data);
    } catch {
      toast.error("Failed to load classes");
    }
  };

  const fetchAcademicYears = async () => {
    try {
      const res = await adminService.getAcademicYears();
      setAcademicYears(res.data.data);
    } catch {
      toast.error("Failed to load academic years");
    }
  };

  /* ================= CALCULATE TOTAL ================= */

  const totalAmount = useMemo(() => {
    return formData.components.reduce(
      (sum, comp) => sum + Number(comp.amount || 0),
      0
    );
  }, [formData.components]);

  /* ================= COMPONENT HANDLERS ================= */

  const handleComponentChange = (index, field, value) => {
    const updated = [...formData.components];
    updated[index][field] = value;
    setFormData({ ...formData, components: updated });
  };

  const addComponent = () => {
    setFormData({
      ...formData,
      components: [
        ...formData.components,
        { name: "", amount: "", type: "monthly" },
      ],
    });
  };

  const removeComponent = (index) => {
    const updated = formData.components.filter((_, i) => i !== index);
    setFormData({ ...formData, components: updated });
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.classId || !formData.academicYearId) {
      return toast.error("Class & Academic Year required");
    }

    if (formData.components.some((c) => !c.name || !c.amount)) {
      return toast.error("All components must have name & amount");
    }

    if (totalAmount <= 0) {
      return toast.error("Total amount must be greater than 0");
    }

    setLoading(true);

    try {
      await adminService.createFeeStructure({
        class: formData.classId,
        academicYear: formData.academicYearId,
        lateFinePerDay: formData.lateFinePerDay,
        graceDays: formData.graceDays,
        components: formData.components,
      });

      toast.success("Fee Structure Created Successfully 🚀");

      setFormData({
        classId: "",
        academicYearId: "",
        lateFinePerDay: 10,
        graceDays: 3,
        components: [{ name: "", amount: "", type: "monthly" }],
      });

    } catch (err) {
      toast.error(err.response?.data?.message || "Creation failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="space-y-10">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-3xl font-bold text-gray-800">
          Create Fee Structure
        </h1>
        <p className="text-gray-500">
          Configure class-wise fee components and automation rules
        </p>
      </motion.div>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white p-8 rounded-2xl shadow-xl space-y-10 border"
      >
        {/* Basic Info */}
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <label className="text-sm font-medium">Class</label>
            <select
              className="input-field mt-2"
              value={formData.classId}
              onChange={(e) =>
                setFormData({ ...formData, classId: e.target.value })
              }
            >
              <option value="">Select Class</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name} {cls.section}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Academic Year</label>
            <select
              className="input-field mt-2"
              value={formData.academicYearId}
              onChange={(e) =>
                setFormData({ ...formData, academicYearId: e.target.value })
              }
            >
              <option value="">Select Academic Year</option>
              {academicYears.map((year) => (
                <option key={year._id} value={year._id}>
                  {year.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Fine Rules */}
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <label className="text-sm font-medium">
              Late Fine Per Day (₹)
            </label>
            <input
              type="number"
              className="input-field mt-2"
              value={formData.lateFinePerDay}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  lateFinePerDay: Number(e.target.value),
                })
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium">Grace Days</label>
            <input
              type="number"
              className="input-field mt-2"
              value={formData.graceDays}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  graceDays: Number(e.target.value),
                })
              }
            />
          </div>
        </div>

        {/* Components */}
        <div>
          <h2 className="text-lg font-semibold mb-6">Fee Components</h2>

          {formData.components.map((comp, index) => (
            <div
              key={index}
              className="grid md:grid-cols-4 gap-4 mb-4 items-end"
            >
              <input
                type="text"
                placeholder="Component Name"
                className="input-field"
                value={comp.name}
                onChange={(e) =>
                  handleComponentChange(index, "name", e.target.value)
                }
              />

              <input
                type="number"
                placeholder="Amount"
                className="input-field"
                value={comp.amount}
                onChange={(e) =>
                  handleComponentChange(index, "amount", e.target.value)
                }
              />

              <select
                className="input-field"
                value={comp.type}
                onChange={(e) =>
                  handleComponentChange(index, "type", e.target.value)
                }
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="one-time">One Time</option>
              </select>

              <button
                type="button"
                onClick={() => removeComponent(index)}
                className="text-red-500 hover:text-red-700"
              >
                <FaTrash />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addComponent}
            className="flex items-center gap-2 text-blue-600 mt-4"
          >
            <FaPlus /> Add Component
          </button>
        </div>

        {/* Total Preview */}
        <div className="bg-indigo-50 p-6 rounded-xl text-right border">
          <p className="text-sm text-gray-600">
            Total Structure Amount
          </p>
          <h2 className="text-3xl font-bold text-indigo-700">
            ₹ {totalAmount}
          </h2>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full text-lg"
        >
          {loading ? "Creating..." : "Create Fee Structure"}
        </button>
      </motion.form>
    </div>
  );
};

export default FeeStructure;
