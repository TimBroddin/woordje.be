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

const Stat = ({ label, value }) => (
  <div className="flex-1 text-center">
    <div className="font-display text-3xl font-semibold tabular-nums leading-none">{value}</div>
    <div className="text-xs text-[var(--muted-foreground)] mt-1.5 leading-tight">{label}</div>
  </div>
);

const DistributionBar = ({ label, value, percentage, isHighlighted }) => (
  <div className="flex items-center gap-3 text-xs">
    <div className="w-4 text-right font-bold tabular-nums text-[var(--muted-foreground)]">{label}</div>
    <div className="flex-1 h-6">
      <div
        className={cn(
          "h-full min-w-7 flex items-center justify-end px-2 rounded-md font-bold tabular-nums",
          isHighlighted ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "bg-[var(--muted)]"
        )}
        style={{ width: `${Math.max(percentage, 7)}%` }}
      >
        {value}
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

  // Losses at the end, after the highest number of tries
  distributionValues.push({
    label: "×",
    value: distribution[-1] || 0,
    pct: distribution[-1] ? (distribution[-1] / maxDistributionValue) * 100 : 0,
  });

  return (
    <Dialog open={visible} onOpenChange={(open) => !open && closeHandler()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Jouw statistieken</DialogTitle>
          <p className="text-sm text-[var(--muted-foreground)]">Woorden van {wordLength} letters</p>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex divide-x divide-[var(--border)]">
            <Stat label="gespeeld" value={totalGames} />
            <Stat label="gewonnen" value={`${pctWins}%`} />
            <Stat label="langste reeks" value={biggestStreak} />
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-3">
              Aantal pogingen
            </h3>
            <div className="space-y-1.5">
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
            {lost > 0 && (
              <p className="text-xs text-[var(--muted-foreground)] mt-2">× = niet geraden ({lost}×)</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Statistics;
