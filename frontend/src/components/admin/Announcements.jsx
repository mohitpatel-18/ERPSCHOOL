import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { FaPlus, FaBullhorn } from "react-icons/fa";
import AnnouncementForm from "./AnnouncementForm";
import AnnouncementList from "./AnnouncementList";
import { adminService } from "../../services/adminService";
import toast from "react-hot-toast";

const Announcements = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [targetFilter, setTargetFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH DATA ================= */
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);

      // 🔥 Admin sees all (including expired)
      const res = await adminService.getAllAnnouncementsAdmin();

      setAnnouncements(res.data.data);
    } catch (err) {
      toast.error("Failed to fetch announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  /* ================= STATUS ================= */
  const getStatus = (item) => {
    if (!item.isActive) return "Inactive";

    const today = new Date();
    const expiry = new Date(item.expiryDate);

    return expiry >= today ? "Active" : "Expired";
  };

  /* ================= FILTER ================= */
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((item) => {
      const matchesSearch = item.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesTarget =
        targetFilter === "All" || item.target === targetFilter;

      const matchesStatus =
        statusFilter === "All" ||
        getStatus(item) === statusFilter;

      return matchesSearch && matchesTarget && matchesStatus;
    });
  }, [announcements, searchTerm, targetFilter, statusFilter]);

  /* ================= CREATE / UPDATE ================= */
  const handleAddOrUpdate = async (data) => {
    try {
      if (editingAnnouncement) {
        await adminService.updateAnnouncement(editingAnnouncement._id, data);
        toast.success("Announcement updated");
      } else {
        await adminService.createAnnouncement(data);
        toast.success("Announcement created");
      }

      fetchAnnouncements();
      setEditingAnnouncement(null);
      setShowForm(false);
    } catch (err) {
      toast.error("Operation failed");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    try {
      await adminService.deleteAnnouncement(id);
      toast.success("Announcement deactivated");
      fetchAnnouncements();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  /* ================= TOGGLE ================= */
  const handleToggle = async (id) => {
    try {
      await adminService.toggleAnnouncement(id);
      toast.success("Status updated");
      fetchAnnouncements();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleEdit = (item) => {
    setEditingAnnouncement(item);
    setShowForm(true);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FaBullhorn className="text-2xl text-primary-600" />
          <h2 className="text-3xl font-bold text-gray-800">Announcements</h2>
        </div>

        <button
          onClick={() => {
            setEditingAnnouncement(null);
            setShowForm(true);
          }}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg shadow hover:scale-105 transition"
        >
          <FaPlus />
          <span>Add Announcement</span>
        </button>
      </div>

      {/* SEARCH + FILTER */}
      <div className="bg-white p-4 rounded-xl shadow flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Search by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={targetFilter}
          onChange={(e) => setTargetFilter(e.target.value)}
          className="p-2 border rounded-lg"
        >
          <option value="All">All Targets</option>
          <option value="Teachers">Teachers</option>
          <option value="Students">Students</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 border rounded-lg"
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Expired">Expired</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* LIST */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">
          Loading announcements...
        </div>
      ) : (
        <AnnouncementList
          announcements={filteredAnnouncements}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onToggle={handleToggle}
          getStatus={getStatus}
        />
      )}

      {/* FORM MODAL */}
      {showForm && (
        <AnnouncementForm
          onClose={() => {
            setShowForm(false);
            setEditingAnnouncement(null);
          }}
          onSubmit={handleAddOrUpdate}
          initialData={editingAnnouncement}
        />
      )}
    </motion.div>
  );
};

export default Announcements;
