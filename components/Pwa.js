import { useEffect, useState } from "react";
import Head from "next/head";
import { usePlausible } from "next-plausible";

const Pwa = () => {
  const plausible = usePlausible();
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      window.workbox !== undefined
    ) {
      const wb = window.workbox;
      const promptNewVersionAvailable = (event) => {
        if (
          confirm(
            "Er is een nieuwe versie van Woordje beschikbaar. Wil je deze laden?"
          )
        ) {
          wb.addEventListener("controlling", (event) => {
            window.location.reload();
          });

          // Send a message to the waiting service worker, instructing it to activate.
          wb.messageSkipWaiting();
        } else {
          console.log(
            "User rejected to reload the web app, keep using old version. New version will be automatically load when user open the app next time."
          );
        }
      };

      // wb.addEventListener("waiting", promptNewVersionAvailable);
      wb.addEventListener("installed", (event) => {
        plausible("Install");
      });

      wb.register();
    }
  }, [plausible]);

  return (
    <>
      <Head>
        <meta name="application-name" content="Woordje" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Woordje" />
        <meta name="apple-mobile-web-app-name" content="Woordje" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#ffffff" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <link rel="apple-touch-icon" href="/icons/favicon-180.png" />
        <link
          rel="icon"
          type="image/png"
          sizes="512x512"
          href="/icons/favicon-512.png"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="google" content="notranslate" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
    </>
  );
};

export default Pwa;
