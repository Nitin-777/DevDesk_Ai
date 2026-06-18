const styles = {
  low: "bg-gray-50 text-gray-700 border-gray-200",
  medium: "bg-sky-50 text-sky-700 border-sky-200",
  high: "bg-orange-50 text-orange-700 border-orange-200",
  urgent: "bg-red-50 text-red-700 border-red-200",
};

const PriorityBadge = ({ priority }) => {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
        styles[priority] || styles.medium
      }`}
    >
      {priority}
    </span>
  );
};

export default PriorityBadge;