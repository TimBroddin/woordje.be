"use client";

import { ThemeProvider } from "next-themes";
import { LazyMotion, domAnimation } from "framer-motion";
import { StoreProvider } from "./StoreProvider";

/**
 * All client-side providers wrapped together
 */
export function ClientProviders({ children }) {
  return (
    <LazyMotion features={domAnimation}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <StoreProvider>{children}</StoreProvider>
      </ThemeProvider>
    </LazyMotion>
  );
}
