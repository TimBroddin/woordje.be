"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { useSettingsStore } from "@/lib/stores/settings-store";
import { useStatisticsStore } from "@/lib/stores/statistics-store";
import { useUIStore } from "@/lib/stores/ui-store";

const DistributionBar = ({ tries, amount, maxAmount, isOwn }) => (
  <div className="flex items-center gap-3 text-xs">
    <div className="w-4 text-right font-bold tabular-nums text-[var(--muted-foreground)]">{tries}</div>
    <div className="flex-1 h-6">
      <div
        className={cn(
          "h-full min-w-8 flex items-center justify-end px-2 rounded-md font-bold tabular-nums",
          isOwn ? "bg-[var(--color-good)] text-white" : "bg-[var(--muted)] text-[var(--foreground)]"
        )}
        style={{ width: `${Math.max((amount / maxAmount) * 100, 8)}%` }}
      >
        {amount}%
      </div>
    </div>
  </div>
);

/** How everybody did on today's word, with the distribution behind a disclosure. */
const GameStats = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { wordLength, gameId } = useSettingsStore();
  const { gameStats } = useUIStore();
  const { data: ownStats } = useStatisticsStore();
  const distribution = [];
  const ownScore = ownStats?.[wordLength]?.[gameId];

  for (let i = 1; i <= wordLength + 1; i++) {
    distribution.push(gameStats?.distribution?.find((d) => d.tries === i)?.amount || 0);
  }

  const maxDistributionValue = Math.max(...distribution, 1);
  const winPercentage = Math.round(gameStats?.wins ?? 0);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full flex items-center gap-3 px-1 text-left group">
        <span className="font-display text-3xl font-semibold tabular-nums leading-none">{winPercentage}%</span>
        <span className="flex-1 text-sm text-[var(--muted-foreground)] leading-snug">
          van alle spelers vond het woord van vandaag
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--primary)]">
          {isOpen ? "Verberg" : "Verdeling"}
          <ChevronDown
            className={cn("size-4 transition-transform duration-200", isOpen && "rotate-180")}
            aria-hidden="true"
          />
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-1.5 pt-4 px-1">
          {distribution.map((amount, k) => (
            <DistributionBar
              key={`gameStatsDistribution-${k}`}
              tries={k + 1}
              amount={amount}
              maxAmount={maxDistributionValue}
              isOwn={ownScore === k + 1}
            />
          ))}
          <p className="text-xs text-[var(--muted-foreground)] pt-1">
            Aantal pogingen{ownScore > 0 ? ", jouw score in het groen" : ""}.
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default GameStats;
