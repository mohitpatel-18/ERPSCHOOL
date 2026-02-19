const RiskStudents = ({ data }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-bold mb-4 text-red-600">
        At-Risk Students
      </h3>

      <div className="space-y-3">
        {data.map((item, i) => (
          <div
            key={i}
            className="flex justify-between items-center bg-red-50 p-3 rounded-lg"
          >
            <div>
              <p className="font-semibold">
                {item._id?.userId?.name}
              </p>
              <p className="text-xs text-gray-500">
                {item._id?.userId?.email}
              </p>
            </div>

            <span className="text-red-600 font-bold">
              {item.attendance}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RiskStudents;
