const styles = {
  open: "bg-blue-50 text-blue-700 border-blue-200",
  assigned: "bg-indigo-50 text-indigo-700 border-indigo-200",
  "in-progress": "bg-yellow-50 text-yellow-700 border-yellow-200",
  resolved: "bg-green-50 text-green-700 border-green-200",
  closed: "bg-gray-100 text-gray-700 border-gray-300",
};

const StatusBadge = ({ status }) => {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
        styles[status] || styles.open
      }`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;