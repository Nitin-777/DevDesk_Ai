const styles = {
  low: "text-[#66716d]",
  medium: "text-[#37677a]",
  high: "text-[#9a5b22]",
  urgent: "text-[#a33a35]",
};

const PriorityBadge = ({ priority }) => {
  return (
    <span
      className={`inline-flex items-center text-[11px] font-semibold uppercase ${
        styles[priority] || styles.medium
      }`}
    >
      {priority} priority
    </span>
  );
};

export default PriorityBadge;
