import { RISK_LABEL, type RiskLevel } from "@/lib/mock-data";

const styles: Record<RiskLevel, string> = {
  unacceptable: "bg-[#f7e4e2] text-[#8f271f] border-[#e6b6b1]",
  high: "bg-[#f7ead8] text-[#8a4f14] border-[#e6cba3]",
  limited: "bg-[#f2e9d9] text-[#7c5a2e] border-[#e0d0b3]",
  minimal: "bg-brand-soft text-brand-strong border-[#bfdccf]",
};

export function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[level]}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {RISK_LABEL[level]}
    </span>
  );
}
