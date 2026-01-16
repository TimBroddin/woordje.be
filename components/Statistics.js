"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import { useSettingsStore } from "@/lib/stores/settings-store";
import { useStatisticsStore } from "@/lib/stores/statistics-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { calculateStatistics } from "@/lib/helpers";

const StatCard = ({ title, value, subtitle, variant = "default", className }) => (
  <div
    className={cn(
      "p-4 rounded-2xl border-none",
      "shadow-[var(--shadow-soft-sm)]",
      variant === "success" && "bg-gradient-to-br from-[var(--color-good)] to-[var(--color-good-dark)]",
      variant === "warning" && "bg-gradient-to-br from-[var(--color-off)] to-[var(--color-off-dark)]",
      variant === "gradient" && "bg-gradient-to-br from-[var(--primary)] via-[#ff8585] to-[var(--accent)]",
      variant === "primary" && "bg-gradient-to-br from-[var(--primary)] to-[#ff5252]",
      variant === "default" && "bg-[var(--surface)]",
      className
    )}
  >
    <p className={cn(
      "text-xs font-bold uppercase tracking-wide mb-1",
      variant !== "default" ? "text-white/80" : "text-[var(--muted-foreground)]"
    )}>
      {title}
    </p>
    <p
      className={cn(
        "text-3xl font-black",
        variant !== "default" ? "text-white" : "text-[var(--foreground)]"
      )}
      style={{ fontFamily: "var(--font-display)" }}
    >
      {value}
      {subtitle && (
        <span className="text-sm font-normal ml-1">({subtitle})</span>
      )}
    </p>
  </div>
);

const DistributionBar = ({ label, value, percentage, isHighlighted }) => (
  <div className="flex items-center gap-3">
    <div className={cn(
      "w-9 h-9 flex items-center justify-center",
      "border-none rounded-xl",
      "font-bold text-sm",
      isHighlighted
        ? "bg-gradient-to-br from-[var(--color-good)] to-[var(--color-good-dark)] text-white shadow-[0_0_12px_rgba(107,203,119,0.3)]"
        : "bg-[var(--muted)]"
    )}>
      {label}
    </div>
    <div className="flex-1 h-8 bg-[var(--muted)] rounded-full border-none overflow-hidden">
      <div
        className={cn(
          "h-full flex items-center px-3 rounded-full",
          "bg-gradient-to-r from-[var(--primary)] to-[#ff5252] text-white text-xs font-bold",
          "transition-all duration-500 ease-out"
        )}
        style={{ width: `${Math.max(percentage, value ? 10 : 0)}%` }}
      >
        {value > 0 && <span>{value}×</span>}
      </div>
    </div>
  </div>
);

const Statistics = ({ visible }) => {
  const { setModal } = useUIStore();
  const { wordLength, boardSize, gameId } = useSettingsStore();
  const { data: statistics } = useStatisticsStore();

  const closeHandler = () => {
    setModal(null);
  };

  const { wins, lost, distribution, biggestStreak } = calculateStatistics(statistics, wordLength, gameId);
  const totalGames = wins + lost;
  const pctWins = totalGames ? Math.round((wins / totalGames) * 100) : 0;
  const pctLost = totalGames ? Math.round((lost / totalGames) * 100) : 0;

  const maxDistributionValue = Math.max(...Object.values(distribution), 1);
  const distributionValues = Array.from({ length: boardSize }).map(
    (_, idx) => {
      return {
        label: idx + 1,
        value: distribution[idx + 1] || 0,
        pct: distribution[idx + 1]
          ? (distribution[idx + 1] / maxDistributionValue) * 100
          : 0,
      };
    }
  );

  // Add losses at the beginning
  distributionValues.unshift({
    label: "💀",
    value: distribution[-1] || 0,
    pct: distribution[-1] ? (distribution[-1] / maxDistributionValue) * 100 : 0,
  });

  return (
    <Dialog open={visible} onOpenChange={(open) => !open && closeHandler()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Statistieken — <span className="font-mono">{wordLength}</span> letters
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              title="🎉 Gewonnen"
              value={wins}
              subtitle={`${pctWins}%`}
              variant="success"
            />
            <StatCard
              title="💀 Verloren"
              value={lost}
              subtitle={`${pctLost}%`}
              variant="warning"
            />
            <StatCard
              title="🎳 Langste streak"
              value={biggestStreak}
              variant="gradient"
              className="col-span-2"
            />
          </div>

          {/* Distribution */}
          <div className="p-4 bg-[var(--muted)] rounded-2xl border-none">
            <h3 className="text-sm font-bold text-[var(--foreground)] mb-3">
              Verdeling pogingen
            </h3>
            <div className="space-y-2">
              {distributionValues.map((item, idx) => (
                <DistributionBar
                  key={`dist-${idx}`}
                  label={item.label}
                  value={item.value}
                  percentage={item.pct}
                  isHighlighted={item.value === maxDistributionValue && item.value > 0}
                />
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Statistics;
