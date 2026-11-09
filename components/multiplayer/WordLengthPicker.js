"use client";

import { Levels, Level } from "@/components/styled";

export default function WordLengthPicker({ value, onChange, disabled }) {
  return (
    <Levels role="radiogroup" aria-label="Aantal letters">
      {[3, 4, 5, 6, 7, 8, 9, 10].map((len) => (
        <Level
          key={len}
          href="#"
          role="radio"
          aria-checked={value === len}
          aria-label={`${len} letters`}
          aria-disabled={disabled || undefined}
          active={value === len}
          className={disabled && value !== len ? "flex-1 opacity-40 pointer-events-none" : "flex-1"}
          onClick={(e) => {
            e.preventDefault();
            if (!disabled) onChange(len);
          }}
        >
          {len}
        </Level>
      ))}
    </Levels>
  );
}
