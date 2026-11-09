import { notFound } from "next/navigation";
import { isValidCode } from "@/lib/multiplayer/config";
import RoomClient from "./room-client";

// Rooms are live and personal; nothing to cache here
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { code } = await params;
  return {
    title: `Kamer ${code.toUpperCase()} - Woordje multiplayer (beta)`,
    description: "Je bent uitgenodigd voor een potje Woordje multiplayer. Doe mee!",
    robots: { index: false },
  };
}

export default async function RoomPage({ params }) {
  const { code } = await params;
  if (!isValidCode(code)) notFound();
  // key: a different room is a fresh component (connection, state, timers)
  return <RoomClient key={code.toUpperCase()} code={code.toUpperCase()} />;
}
