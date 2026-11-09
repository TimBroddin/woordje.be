import MultiplayerClient from "./multiplayer-client";

export const metadata = {
  title: "Multiplayer (beta) - Woordje",
  description:
    "Speel Woordje tegen je vrienden of tegen andere spelers. Iedereen raadt hetzelfde woord; wie het met de minste pogingen vindt, wint.",
};

export default function MultiplayerPage() {
  return <MultiplayerClient />;
}
