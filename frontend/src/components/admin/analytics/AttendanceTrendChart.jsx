const ClassAttendanceTable = ({ data }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-bold mb-4">Class Attendance Ranking</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Class</th>
              <th className="p-3 text-right">Attendance %</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, i) => (
              <tr key={i} className="border-b">
                <td className="p-3">
                  {item.classId?.name} {item.classId?.section}
                </td>
                <td className="p-3 text-right font-semibold">
                  {item.percentage}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClassAttendanceTable;
