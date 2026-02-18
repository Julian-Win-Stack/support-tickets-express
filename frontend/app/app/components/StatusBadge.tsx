export function StatusBadge({
  status,
  label,
}: {
  status: "resolved" | "open" | "in_progress";
  label: string;
}) {
  const bg =
    status === "resolved"
      ? "bg-[#243353]"
      : status === "open"
        ? "bg-[#0e7490]"
        : "bg-[#7c3aed]";
  return (
    <span
      className={`text-xs px-2 py-1 rounded-full text-white whitespace-nowrap ${bg}`}
    >
      {label}
    </span>
  );
}
