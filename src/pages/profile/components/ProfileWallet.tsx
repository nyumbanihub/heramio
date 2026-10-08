import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TransactionRow from "@/components/feature/TransactionRow";
import { useAppData } from "@/store/AppDataProvider";

export default function ProfileWallet() {
  const { wallet, transactions } = useAppData();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [toast, setToast] = useState("");

  const flash = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
  };

  const shown = expanded ? transactions : transactions.slice(0, 4);

  return (
    <section className="border-b border-background-200/70 px-4 py-5">
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500 p-5 text-background-50">
        <div className="flex items-start justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs font-medium text-background-100">
              <i className="ri-wallet-3-line" />
              In-app balance
            </p>
            <p className="mt-2 font-heading text-3xl font-semibold">
              {wallet.currency} {wallet.available.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-background-100">
              Available to withdraw
            </p>
          </div>
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-background-50/20">
            <i className="ri-secure-payment-line text-xl" />
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-background-50/15 p-3">
            <p className="text-[11px] text-background-100">Pending</p>
            <p className="mt-0.5 text-lg font-semibold">{wallet.currency} {wallet.pending.toLocaleString()}</p>
          </div>
          <div className="rounded-xl bg-background-50/15 p-3">
            <p className="text-[11px] text-background-100">Lifetime earnings</p>
            <p className="mt-0.5 text-lg font-semibold">{wallet.currency} {wallet.lifetimeEarnings.toLocaleString()}</p>
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() => navigate("/host")}
            className="flex-1 cursor-pointer whitespace-nowrap rounded-md bg-background-50 px-4 py-2.5 text-sm font-semibold text-primary-700"
          >
            Withdraw
          </button>
          <button
            type="button"
            onClick={() => flash("Add funds opening")}
            className="flex-1 whitespace-nowrap rounded-md border border-background-50/40 px-4 py-2.5 text-sm font-semibold text-background-50"
          >
            Add funds
          </button>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-base font-semibold text-foreground-950">
            Transaction history
          </h3>
          <span className="text-xs text-foreground-500">{transactions.length} records</span>
        </div>

        <ul className="mt-1 divide-y divide-background-200/60">
          {shown.map((tx) => (
            <TransactionRow key={tx.id} tx={tx} />
          ))}
        </ul>

        {transactions.length > 4 ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-2 w-full whitespace-nowrap rounded-md border border-background-300 py-2.5 text-sm font-medium text-foreground-800"
          >
            {expanded ? "Show less" : `See all ${transactions.length} transactions`}
          </button>
        ) : null}
      </div>

      {toast ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4">
          <span className="rounded-full bg-foreground-950 px-4 py-2 text-xs font-medium text-background-50">
            {toast}
          </span>
        </div>
      ) : null}
    </section>
  );
}