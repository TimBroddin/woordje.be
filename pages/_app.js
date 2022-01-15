import "../styles/globals.css";
import PlausibleProvider from "next-plausible";
import { GameContextProvider } from "../data/context";

function MyApp({ Component, pageProps }) {
  return (
    <PlausibleProvider domain="woordje.be">
      <GameContextProvider>
        <>
          <Component {...pageProps} />
        </>
      </GameContextProvider>
    </PlausibleProvider>
  );
}

export default MyApp;
