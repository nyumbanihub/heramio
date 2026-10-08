import type { Transaction } from "@/lib/types";

const statusStyles: Record<Transaction["status"], string> = {
  pending: "bg-accent-100 text-accent-800",
  completed: "bg-secondary-100 text-secondary-800",
  failed: "bg-primary-100 text-primary-700",
  Completed: "bg-secondary-100 text-secondary-800",
  Pending: "bg-accent-100 text-accent-800",
  Held: "bg-primary-100 text-primary-700",
  Refunded: "bg-background-200 text-foreground-700",
};

export default function TransactionRow({ tx }: { tx: Transaction }) {
  const positive = tx.amount > 0;

  return (
    <li className="flex items-center gap-3 py-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background-100 text-foreground-700">
        <i className={`${tx.icon} text-lg`} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground-950">{tx.title}</p>
        <p className="truncate text-xs text-foreground-500">{tx.subtitle}</p>
      </div>
      <div className="shrink-0 text-right">
        <p
          className={`text-sm font-semibold ${
            positive ? "text-secondary-700" : "text-foreground-950"
          }`}
        >
          {positive ? "+" : "-"}KES {Math.abs(tx.amount).toLocaleString()}
        </p>
        <span
          className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${statusStyles[tx.status]}`}
        >
          {tx.status}
        </span>
      </div>
    </li>
  );
}