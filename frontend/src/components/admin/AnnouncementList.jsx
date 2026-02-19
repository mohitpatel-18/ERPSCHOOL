import React from "react";
import { motion } from "framer-motion";
import {
  FaTrash,
  FaEdit,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";

const AnnouncementList = ({
  announcements,
  onDelete,
  onEdit,
  onToggle,
  getStatus,
}) => {
  if (announcements.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow text-center text-gray-500">
        No announcements found.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-100 text-gray-700 uppercase text-sm">
          <tr>
            <th className="p-4">Title</th>
            <th className="p-4">Target</th>
            <th className="p-4">Expiry</th>
            <th className="p-4">Status</th>
            <th className="p-4">Created By</th>
            <th className="p-4 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {announcements.map((item, index) => {
            const status = getStatus(item);

            return (
              <motion.tr
                key={item._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="border-t hover:bg-gray-50"
              >
                {/* TITLE + DESCRIPTION */}
                <td className="p-4">
                  <p className="font-semibold text-gray-800">
                    {item.title}
                  </p>
                  <p className="text-sm text-gray-500 truncate max-w-xs">
                    {item.description}
                  </p>
                </td>

                {/* TARGET */}
                <td className="p-4">{item.target}</td>

                {/* EXPIRY */}
                <td className="p-4">
                  {new Date(item.expiryDate).toLocaleDateString()}
                </td>

                {/* STATUS */}
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      status === "Active"
                        ? "bg-green-100 text-green-700"
                        : status === "Expired"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {status}
                  </span>
                </td>

                {/* CREATED BY */}
                <td className="p-4 text-sm text-gray-600">
                  {item.createdBy?.name || "Admin"}
                </td>

                {/* ACTIONS */}
                <td className="p-4 text-center space-x-3">

                  {/* EDIT */}
                  <button
                    onClick={() => onEdit(item)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Edit"
                  >
                    <FaEdit />
                  </button>

                  {/* TOGGLE */}
                  <button
                    onClick={() => onToggle(item._id)}
                    className="text-purple-600 hover:text-purple-800"
                    title="Toggle Active"
                  >
                    {item.isActive ? <FaToggleOn /> : <FaToggleOff />}
                  </button>

                  {/* DELETE (Soft) */}
                  <button
                    onClick={() => onDelete(item._id)}
                    className="text-red-600 hover:text-red-800"
                    title="Deactivate"
                  >
                    <FaTrash />
                  </button>

                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AnnouncementList;
