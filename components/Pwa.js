import { useEffect } from "react";
import Head from "next/head";
import { usePlausible } from "next-plausible";

const Pwa = () => {
  const plausible = usePlausible();
  // This hook only run once in browser after the component is rendered for the first time.
  // It has same effect as the old componentDidMount lifecycle callback.
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      window.workbox !== undefined
    ) {
      const wb = window.workbox;

      wb.addEventListener("installed", (event) => {
        plausible("Install");
      });

      wb.register();
    }
  }, []);

  return (
    <Head>
      <meta name="application-name" content="Woordje" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Woordje" />
      <meta name="apple-mobile-web-app-name" content="Woordje" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta
        name="apple-mobile-web-app-status-bar-style"
        content="black-translucent"
      />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="512x512" href="/favicon.png" />
      <link rel="manifest" href="/manifest.json" />
    </Head>
  );
};

export default Pwa;
