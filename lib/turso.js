import { createClient } from "@libsql/client";

let tursoClient = null;

function getTurso() {
  if (!tursoClient) {
    if (!process.env.TURSO_URL) {
      throw new Error("TURSO_URL environment variable is not set");
    }
    tursoClient = createClient({
      url: process.env.TURSO_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return tursoClient;
}

export default getTurso;
