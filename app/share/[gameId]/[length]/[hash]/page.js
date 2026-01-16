import { redirect } from "next/navigation";

export async function generateMetadata({ params }) {
  const { gameId, length, hash } = await params;
  const wordLength = parseInt(length);

  // Use gameId as displayGameId (default nl-BE style)
  const displayGameId = parseInt(gameId);

  // Parse the hash to extract game result lines
  const lines = hash.match(new RegExp(`.{1,${wordLength}}`, "g")) || [];

  // Check if won (last line is all "V"s)
  const wonPattern = Array.from({ length: wordLength })
    .map(() => "V")
    .join("");
  const won = lines.length > 0 && lines[lines.length - 1] === wonPattern;
  const tries = won ? lines.length : "X";

  const title = `Woordje #${displayGameId} x ${length} - ${tries}/${wordLength + 1}`;
  const description = lines.join("\n");

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: "Woordje",
      images: [
        {
          url: "/og.png",
          width: 1200,
          height: 630,
          alt: "Woordje",
        },
      ],
    },
    twitter: {
      creator: "@timbroddin",
      card: "summary",
    },
  };
}

export default function SharePage() {
  // Redirect to home page after meta tags are served
  redirect("/");
}
