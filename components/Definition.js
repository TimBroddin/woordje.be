"use client";

import { useEffect, useState } from "react";

const MAX_DEFINITIONS = 3;

const wiktionaryUrl = (word) =>
  `https://nl.wiktionary.org/wiki/${encodeURIComponent(word)}`;

// Extract the Dutch definitions from a rendered nl.wiktionary page
const parseDefinitions = (html) => {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const heading = doc.getElementById("Nederlands");
  if (!heading) return [];

  const lists = [];
  const section = heading.closest("section");
  if (section) {
    // Parsoid output: the language section is a <section> with every
    // subsection nested inside it
    for (const ol of section.querySelectorAll("ol")) {
      if (!ol.parentElement.closest("li") && !ol.classList.contains("references")) {
        lists.push(ol);
      }
    }
  } else {
    // Legacy output: headings are wrapped in <div class="mw-heading">, walk
    // its siblings until the next language section starts
    let node = (heading.closest(".mw-heading") || heading).nextElementSibling;
    while (node && !node.classList.contains("mw-heading2")) {
      if (node.tagName === "OL") lists.push(node);
      node = node.nextElementSibling;
    }
  }

  const definitions = [];
  for (const ol of lists) {
    for (const li of ol.children) {
      const clone = li.cloneNode(true);
      clone.querySelectorAll("dl, ul, ol, sup").forEach((el) => el.remove());
      const text = clone.textContent.replace(/\s+/g, " ").trim();
      if (text) definitions.push(text);
    }
  }
  return definitions.slice(0, MAX_DEFINITIONS);
};

const cache = new Map();

const fetchDefinitions = async (word) => {
  if (cache.has(word)) return cache.get(word);
  const params = new URLSearchParams({
    action: "parse",
    page: word,
    prop: "text",
    format: "json",
    formatversion: "2",
    redirects: "1",
    disableeditsection: "1",
    origin: "*",
  });
  const res = await fetch(`https://nl.wiktionary.org/w/api.php?${params}`);
  const json = await res.json();
  const definitions = json?.parse?.text ? parseDefinitions(json.parse.text) : [];
  cache.set(word, definitions);
  return definitions;
};

const Definition = ({ word }) => {
  const [definitions, setDefinitions] = useState(null);

  useEffect(() => {
    if (!word) return;
    let cancelled = false;
    setDefinitions(null);
    fetchDefinitions(word)
      .then((result) => !cancelled && setDefinitions(result))
      .catch(() => !cancelled && setDefinitions([]));
    return () => {
      cancelled = true;
    };
  }, [word]);

  if (!definitions?.length) return null;

  return (
    <div className="p-4 bg-[var(--muted)] rounded-xl border-none text-sm text-[var(--foreground)]">
      <strong className="text-[var(--primary)]">Betekenis</strong>
      <ol className="list-decimal pl-5 mt-2 space-y-1">
        {definitions.map((definition, i) => (
          <li key={i}>{definition}</li>
        ))}
      </ol>
      <a
        href={wiktionaryUrl(word)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mt-2 text-xs text-[var(--muted-foreground)] hover:underline"
      >
        Bron: WikiWoordenboek
      </a>
    </div>
  );
};

export default Definition;
