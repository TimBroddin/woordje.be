"use client";

import { Card, CardContent } from "@/components/ui/card";
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
  <div className="flex items-center gap-3">
    <div className={cn(
      "w-16 text-right text-xs font-medium",
      "text-[var(--muted-foreground)]"
    )}>
      <span className="font-bold">{tries}</span> {tries === 1 ? "poging" : "pogingen"}
    </div>
    <div className="flex-1 h-7 bg-[var(--muted)] rounded-full border-none overflow-hidden">
      <div
        className={cn(
          "h-full flex items-center justify-end px-3",
          "text-xs font-bold text-white rounded-full",
          "transition-all duration-500 ease-out",
          isOwn
            ? "bg-gradient-to-r from-[var(--color-good)] to-[var(--color-good-dark)]"
            : "bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]"
        )}
        style={{
          width: `${Math.max((amount / maxAmount) * 100, amount ? 12 : 0)}%`,
        }}
      >
        {amount > 0 && <span>{amount}%</span>}
      </div>
    </div>
  </div>
);

const GameStats = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { wordLength, gameId } = useSettingsStore();
  const { gameStats } = useUIStore();
  const { data: ownStats } = useStatisticsStore();
  const distribution = [];
  const ownScore = ownStats?.[wordLength]?.[gameId];

  for (let i = 1; i <= wordLength + 1; i++) {
    distribution.push(
      gameStats?.distribution?.find((d) => d.tries === i)?.amount || 0
    );
  }

  const maxDistributionValue = Math.max(...distribution, 1);
  const winPercentage = Math.round(gameStats?.wins ?? 0);

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full p-4 flex items-center justify-between text-left group">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-14 h-14 flex items-center justify-center",
              "bg-gradient-to-br from-[var(--color-good)] to-[var(--color-good-dark)] text-white",
              "border-none rounded-2xl",
              "font-bold text-lg",
              "shadow-[var(--shadow-soft-sm),_0_0_12px_rgba(107,203,119,0.25)]"
            )}
            style={{ fontFamily: "var(--font-display)" }}
            >
              {winPercentage}%
            </div>
            <span className="text-sm text-[var(--muted-foreground)]">
              van alle spelers vond de oplossing
            </span>
          </div>
          <ChevronDown
            className={cn(
              "h-5 w-5 text-[var(--muted-foreground)]",
              "transition-transform duration-300 ease-out",
              isOpen && "rotate-180"
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 pb-4">
            <div className="space-y-2">
              {distribution?.map((amount, k) => (
                <DistributionBar
                  key={`gameStatsDistribution-${k}`}
                  tries={k + 1}
                  amount={amount}
                  maxAmount={maxDistributionValue}
                  isOwn={ownScore === k + 1}
                />
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default GameStats;
