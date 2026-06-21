const styles = {
  open: "bg-[#e8f1f5] text-[#285a70]",
  assigned: "bg-[#eeeaf6] text-[#5a4777]",
  "in-progress": "bg-[#f7efd9] text-[#795f1f]",
  resolved: "bg-[#dfeee7] text-[#28604d]",
  closed: "bg-[#e8ebe9] text-[#5d6763]",
};

const StatusBadge = ({ status }) => {
  return (
    <span
      className={`inline-flex rounded px-2 py-1 text-[11px] font-semibold capitalize ${
        styles[status] || styles.open
      }`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
