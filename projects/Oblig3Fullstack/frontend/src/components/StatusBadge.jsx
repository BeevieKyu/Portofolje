/**
 * StatusBadge component for displaying game status
 */
export default function StatusBadge({ status }) {
  return (
    <span className={`status-badge status-${status}`}>
      {status === "pending" && "Waiting for players"}
      {status === "active" && "In progress"}
      {status === "completed" && "Completed"}
    </span>
  );
}
