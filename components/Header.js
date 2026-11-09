"use client";

import NextLink from "next/link";
import { ArrowLeft, ChartColumn, CircleHelp, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAnalytics } from "@/lib/analytics";
import { useTranslations } from "@/lib/i18n/use-translations";
import { useUIStore } from "@/lib/stores/ui-store";
import BetaBadge from "@/components/BetaBadge";

const iconButton = cn(
  "h-10 w-9 sm:w-10 inline-flex items-center justify-center rounded-xl",
  "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]",
  "transition-colors duration-150",
  "[&_svg]:size-5"
);

const IconButton = ({ label, children, ...props }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button type="button" aria-label={label} className={iconButton} {...props}>
        {children}
      </button>
    </TooltipTrigger>
    <TooltipContent>{label}</TooltipContent>
  </Tooltip>
);

/**
 * App bar: title on the left, actions on the right.
 * `showHome` adds a back link on the left (to `backHref`, the daily game by default).
 */
const Header = ({
  showInfo = true,
  showStats = true,
  showHome = false,
  backHref = "/",
  backLabel = "Terug naar het spel van vandaag",
  showMultiplayer = showStats,
  customTitle,
  subtitle,
  className,
}) => {
  const { setModal } = useUIStore();
  const translations = useTranslations();
  const track = useAnalytics();

  return (
    <TooltipProvider delayDuration={300}>
      <header className={cn("flex items-center gap-2 px-4 pt-3 pb-4", className)}>
        {showHome && (
          <NextLink href={backHref} aria-label={backLabel} className={cn(iconButton, "-ml-2")}>
            <ArrowLeft />
          </NextLink>
        )}

        {/* The brand title never truncates; long custom titles (pages) may */}
        <div className={cn("flex-1", customTitle ? "min-w-0" : "shrink-0")}>
          <h1 className="font-display font-semibold tracking-tight leading-none text-[28px] sm:text-[32px] truncate">
            {customTitle ? (
              customTitle
            ) : (
              <NextLink href="/" className="no-underline text-inherit">
                {translations.title}
              </NextLink>
            )}
          </h1>
          {subtitle && (
            <p className="text-sm text-[var(--muted-foreground)] mt-1 font-semibold truncate">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {showMultiplayer && (
            <NextLink
              href="/multiplayer"
              onClick={() => track("Multiplayer", { action: "header" })}
              className={cn(
                "relative h-10 px-2 sm:px-3 inline-flex items-center gap-1.5 rounded-xl",
                "text-sm font-bold text-[var(--primary)] hover:bg-[var(--primary-soft)]",
                "transition-colors duration-150 [&_svg]:size-[18px]"
              )}
            >
              <Users aria-hidden="true" />
              <span className="max-[359px]:sr-only">Multiplayer</span>
              {/* Corner tag: adds no width, so the title keeps its room on small phones */}
              <BetaBadge className="absolute -top-1 -right-1 px-1 text-[9px] leading-3 bg-[var(--background)]" />
            </NextLink>
          )}
          {showInfo && (
            <IconButton label="Hoe speel je?" onClick={() => setModal("splash")}>
              <CircleHelp />
            </IconButton>
          )}
          {showStats && (
            <IconButton
              label="Jouw statistieken"
              onClick={() => {
                track("Statistics");
                setModal("statistics");
              }}
            >
              <ChartColumn />
            </IconButton>
          )}
        </div>
      </header>
    </TooltipProvider>
  );
};

export default Header;
