import React, { useEffect, useState } from "react";
import { adminService } from "../../services/adminService";
import toast from "react-hot-toast";

const LeaveRequests = () => {
  const [leaves, setLeaves] = useState([]);

  const fetchLeaves = async () => {
    const res = await adminService.getAllLeaves();
    setLeaves(res.data.data);
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleStatus = async (id, status) => {
    const remark = prompt("Enter remark (required for rejection):");

    if (status === "Rejected" && !remark) {
      return toast.error("Remark required for rejection");
    }

    await adminService.updateLeaveStatus(id, {
      status,
      adminRemark: remark,
    });

    toast.success("Updated");
    fetchLeaves();
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-6">Leave Requests</h2>

      <table className="w-full text-left">
        <thead>
          <tr className="border-b">
            <th>Teacher</th>
            <th>Type</th>
            <th>Dates</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {leaves.map((leave) => (
            <tr key={leave._id} className="border-b">
              <td>{leave.teacher?.userId?.name}</td>
              <td>{leave.leaveType}</td>
              <td>
                {new Date(leave.fromDate).toLocaleDateString()} -{" "}
                {new Date(leave.toDate).toLocaleDateString()}
              </td>
              <td>{leave.status}</td>

              <td className="space-x-2">
                <button
                  onClick={() =>
                    handleStatus(leave._id, "Approved")
                  }
                  className="bg-green-500 text-white px-2 py-1 rounded"
                >
                  Approve
                </button>

                <button
                  onClick={() =>
                    handleStatus(leave._id, "Rejected")
                  }
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeaveRequests;
