import { cn } from "@/lib/utils";
import { m } from "framer-motion";
import { forwardRef } from "react";

export const LetterContainer = forwardRef(
  ({ children, className, ...props }, ref) => {
    return (
      <m.div
        ref={ref}
        className={cn(
          "flex justify-center items-center relative text-center",
          "[transform-style:preserve-3d]",
          "[perspective:1000px]",
          className
        )}
        {...props}
      >
        {children}
      </m.div>
    );
  }
);
LetterContainer.displayName = "LetterContainer";

const LetterFace = forwardRef(
  ({ children, focus, small, className, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        style={style}
        className={cn(
          // Base size with CSS custom property calculations
          // Use max() to ensure minimum readable size, and scale more aggressively for long words
          "w-[max(32px,calc(50px-((var(--word-length,6)-6)*var(--shrink-size,6px))))]",
          "h-[max(32px,calc(50px-((var(--word-length,6)-6)*var(--shrink-size,6px))))]",
          "text-[max(16px,calc(26px-((var(--word-length,6)-6)*var(--shrink-size,4px))))]",
          // Soft, friendly styling
          "letter-tile",
          "m-[max(2px,calc(4px-((var(--word-length,6)-6)*0.5px)))]",
          "relative top-0",
          "[backface-visibility:hidden]",
          "rounded-xl",
          // Focus state with soft glow
          focus && "shadow-[0_0_0_4px_var(--focus-color),_0_0_16px_rgba(192,132,252,0.4)] z-10",
          // Small variant for examples
          small && [
            "w-[max(28px,calc(40px-((var(--word-length,6)-6)*var(--shrink-size,5px))))]",
            "h-[max(28px,calc(40px-((var(--word-length,6)-6)*var(--shrink-size,5px))))]",
            "text-[max(12px,calc(18px-((var(--word-length,6)-6)*var(--shrink-size,3px))))]",
            "rounded-lg",
          ],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
LetterFace.displayName = "LetterFace";

export const LetterFront = LetterFace;

export const LetterBack = forwardRef(
  ({ children, disabled, score, small, className, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        style={style}
        className={cn(
          // Base size with CSS custom property calculations
          // Use max() to ensure minimum readable size, and scale more aggressively for long words
          "w-[max(32px,calc(50px-((var(--word-length,6)-6)*var(--shrink-size,6px))))]",
          "h-[max(32px,calc(50px-((var(--word-length,6)-6)*var(--shrink-size,6px))))]",
          "text-[max(16px,calc(26px-((var(--word-length,6)-6)*var(--shrink-size,4px))))]",
          // Soft, friendly styling
          "letter-tile revealed",
          "font-bold uppercase m-[max(2px,calc(4px-((var(--word-length,6)-6)*0.5px)))]",
          "[backface-visibility:hidden]",
          "flex justify-center items-center",
          "rounded-xl",
          // 3D transform and positioning
          "[transform:rotateY(180deg)]",
          "absolute left-0 right-0 bottom-0",
          // Default background (unknown/unused)
          "bg-[var(--color-unknown)]",
          // Disabled state
          disabled && "bad",
          // Score variants with satisfying gradient colors
          score === "bad" && "bad",
          score === "good" && "good",
          score === "off" && "off",
          // Small variant for examples
          small && [
            "w-[max(28px,calc(40px-((var(--word-length,6)-6)*var(--shrink-size,5px))))]",
            "h-[max(28px,calc(40px-((var(--word-length,6)-6)*var(--shrink-size,5px))))]",
            "text-[max(12px,calc(18px-((var(--word-length,6)-6)*var(--shrink-size,3px))))]",
            "rounded-lg",
          ],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
LetterBack.displayName = "LetterBack";

const letterVariants = {
  hidden: {
    rotateY: 0,
  },
  show: {
    rotateY: 180,
  },
};

const Letter = ({ focus, disabled, score, radius, children, small }) => {
  return (
    <LetterContainer variants={letterVariants}>
      <LetterFront focus={focus} style={radius} disabled={disabled} small={small}>
        {children}
      </LetterFront>
      <LetterBack style={radius} disabled={disabled} score={score} small={small}>
        {children}
      </LetterBack>
    </LetterContainer>
  );
};

export default Letter;
