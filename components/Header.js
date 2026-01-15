"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";
import { usePlausible } from "next-plausible";

import { useTranslations } from "@/lib/i18n/use-translations";
import { useSettingsStore } from "@/lib/stores/settings-store";
import { useUIStore } from "@/lib/stores/ui-store";
import InfoSquare from "@/lib/iconly/Icons/InfoSquare";
import Chart from "@/lib/iconly/Icons/Chart";
import Home from "@/lib/iconly/Icons/Home";

const IconButton = ({ children, onClick, tooltip, className }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button
        onClick={onClick}
        className={cn(
          "w-12 h-12 flex items-center justify-center",
          "border-none rounded-2xl",
          "bg-[var(--surface)] hover:bg-[var(--muted)]",
          "shadow-[var(--shadow-soft-sm)] transition-all duration-200 ease-out",
          "hover:shadow-[var(--shadow-soft)] hover:-translate-y-1 hover:scale-105",
          "active:shadow-[var(--shadow-soft-sm)] active:translate-y-0 active:scale-95",
          className
        )}
      >
        {children}
      </button>
    </TooltipTrigger>
    {tooltip && <TooltipContent>{tooltip}</TooltipContent>}
  </Tooltip>
);

const Header = ({
  showInfo = true,
  showStats = true,
  showHome = false,
  emptyRight = false,
  customTitle,
  titleSize = 52,
  titleColor,
  subtitle,
}) => {
  const { colorBlind } = useSettingsStore();
  const { setModal } = useUIStore();
  const translations = useTranslations();
  const router = useRouter();
  const plausible = usePlausible();

  return (
    <TooltipProvider>
      <header className="mb-6 pt-4 px-4">
        <div className="flex justify-between items-center gap-4">
          {/* Left icon slot */}
          <div className="w-11 flex-shrink-0">
            {showHome && (
              <IconButton
                onClick={() => router.push("/")}
                tooltip="Terug naar home"
              >
                <Home
                  set={colorBlind ? "bold" : "two-tone"}
                  primaryColor="var(--color-icon-left)"
                  secondaryColor="var(--primary)"
                  size="medium"
                />
              </IconButton>
            )}
            {showInfo && !showHome && (
              <IconButton
                onClick={() => setModal("splash")}
                tooltip={`Uitleg over ${translations.title}`}
              >
                <InfoSquare
                  set={colorBlind ? "bold" : "two-tone"}
                  primaryColor="var(--color-icon-left)"
                  secondaryColor="var(--primary)"
                  size="medium"
                />
              </IconButton>
            )}
          </div>

          {/* Title */}
          <div className="flex-1 text-center">
            <h1
              className={cn(
                "font-black tracking-tight leading-none",
                "text-[var(--foreground)]",
                // Decorative soft underline effect
                "relative inline-block",
                "after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2",
                "after:-bottom-1 after:h-[6px] after:w-[80%] after:rounded-full",
                "after:bg-gradient-to-r after:from-[var(--primary)] after:to-[var(--accent)]",
                "after:opacity-70"
              )}
              style={{
                fontSize: titleSize ?? 48,
                fontFamily: "var(--font-display)"
              }}
            >
              {customTitle ? customTitle : translations.title}
            </h1>
            {subtitle && (
              <p className="text-sm text-[var(--muted-foreground)] mt-3 font-medium">
                {subtitle}
              </p>
            )}
          </div>

          {/* Right icon slot */}
          <div className="w-11 flex-shrink-0">
            {showStats && (
              <IconButton
                onClick={() => {
                  plausible("Statistics");
                  setModal("statistics");
                }}
                tooltip="Bekijk je statistieken"
                className="ml-auto"
              >
                <Chart
                  set={colorBlind ? "bold" : "two-tone"}
                  primaryColor="var(--color-icon-right)"
                  secondaryColor="var(--primary)"
                  size="medium"
                />
              </IconButton>
            )}
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
};

export default Header;
