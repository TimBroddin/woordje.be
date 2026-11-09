"use client";

import { Levels, Level } from "@/components/styled";

/** 2–8 players. Counts below `min` (people already in the room) are disabled. */
export default function PlayerCountPicker({ value, onChange, min = 2, disabled }) {
  return (
    <Levels role="radiogroup" aria-label="Aantal spelers">
      {[2, 3, 4, 5, 6, 7, 8].map((count) => {
        const off = disabled || count < min;
        return (
          <Level
            key={count}
            href="#"
            role="radio"
            aria-checked={value === count}
            aria-label={`${count} spelers`}
            aria-disabled={off || undefined}
            active={value === count}
            className={off && value !== count ? "flex-1 opacity-40 pointer-events-none" : "flex-1"}
            onClick={(e) => {
              e.preventDefault();
              if (!off) onChange(count);
            }}
          >
            {count}
          </Level>
        );
      })}
    </Levels>
  );
}
