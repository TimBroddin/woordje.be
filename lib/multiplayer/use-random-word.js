"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchRandomWord } from "@/lib/actions/random-word";

/** A random dictionary word of `wordLength` letters, as inspiration for a first guess. */
export function useRandomWord(wordLength) {
  // Keyed by length, so changing the length never shows a word of the old length
  const [result, setResult] = useState({ wordLength: null, word: "" });

  const load = useCallback(
    (isCancelled = () => false) =>
      fetchRandomWord(wordLength)
        .then((word) => !isCancelled() && setResult({ wordLength, word }))
        .catch(() => {}), // not important enough to bother anyone about
    [wordLength]
  );

  useEffect(() => {
    let cancelled = false;
    load(() => cancelled);
    return () => {
      cancelled = true;
    };
  }, [load]);

  const refresh = useCallback(() => load(), [load]);
  return [result.wordLength === wordLength ? result.word : "", refresh];
}
