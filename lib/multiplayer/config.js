// Base URL of the multiplayer Worker (see /multiplayer). Set
// NEXT_PUBLIC_MULTIPLAYER_URL in Vercel to the deployed worker URL.
export const MULTIPLAYER_URL = (process.env.NEXT_PUBLIC_MULTIPLAYER_URL || "http://localhost:8787").replace(
  /\/$/,
  "",
);

export const MULTIPLAYER_WS_URL = MULTIPLAYER_URL.replace(/^http/, "ws");

export const CODE_LENGTH = 5;
export const isValidCode = (code) => /^[A-Za-z]{5}$/.test(code ?? "");
