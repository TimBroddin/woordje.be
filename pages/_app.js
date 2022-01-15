import "../styles/globals.css";
import PlausibleProvider from "next-plausible";
import { GameContextProvider } from "../data/context";
import Head from "next/head";

function MyApp({ Component, pageProps }) {
  return (
    <PlausibleProvider domain="woordje.be">
      <GameContextProvider>
        <>
          <Head>
            <meta
              name="viewport"
              content="initial-scale=1.0, width=device-width"
            />
          </Head>
          <Component {...pageProps} />
        </>
      </GameContextProvider>
    </PlausibleProvider>
  );
}

export default MyApp;
