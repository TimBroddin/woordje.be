import { cn } from "@/lib/utils";

/**
 * A word or room code drawn as tiles. `score` colours them like game feedback
 * (the revealed word); without it they're neutral outlined tiles (a room code).
 */
export default function CodeTiles({ text, score, className }) {
  return (
    <div className={cn("flex justify-center gap-1.5", className)}>
      {text.split("").map((ch, i) => (
        <span
          key={i}
          className={cn(
            "letter-tile w-11 h-11 text-xl",
            score && `revealed ${score}`,
            !score && "border-[var(--tile-border-filled)]"
          )}
        >
          {ch}
        </span>
      ))}
    </div>
  );
}
