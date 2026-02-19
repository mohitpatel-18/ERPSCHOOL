import React, { useEffect, useState } from "react";
import { teacherService } from "../../services/teacherService";

const MyLeaves = () => {
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    teacherService.getMyLeaves().then((res) => {
      setLeaves(res.data.data);
    });
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow mt-6">
      <h2 className="text-xl font-bold mb-4">My Leave Requests</h2>

      <table className="w-full text-left">
        <thead>
          <tr className="border-b">
            <th>Date</th>
            <th>Type</th>
            <th>Status</th>
            <th>Remark</th>
          </tr>
        </thead>

        <tbody>
          {leaves.map((leave) => (
            <tr key={leave._id} className="border-b">
              <td>
                {new Date(leave.fromDate).toLocaleDateString()} -{" "}
                {new Date(leave.toDate).toLocaleDateString()}
              </td>
              <td>{leave.leaveType}</td>
              <td>{leave.status}</td>
              <td>{leave.adminRemark || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MyLeaves;
