interface AuthNoticeProps {
  variant?: "error" | "success";
  message: string;
}

export default function AuthNotice({ variant = "error", message }: AuthNoticeProps) {
  const styles =
    variant === "error"
      ? "border-primary-200 bg-primary-50 text-primary-800"
      : "border-secondary-200 bg-secondary-50 text-secondary-900";
  const icon = variant === "error" ? "ri-error-warning-line" : "ri-checkbox-circle-line";

  return (
    <div
      role="status"
      className={`flex items-start gap-2 rounded-md border px-3 py-2.5 text-sm ${styles}`}
    >
      <i className={`${icon} mt-0.5 text-base`} />
      <span>{message}</span>
    </div>
  );
}