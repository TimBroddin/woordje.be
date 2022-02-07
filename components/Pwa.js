import { useEffect, useState } from "react";
import Head from "next/head";
import { usePlausible } from "next-plausible";
import styled from "styled-components";
import { motion } from "framer-motion";

const Warning = styled(motion.div)`
  background-color: #e67e22;
  border: 1px solid #d35400;
  max-width: 320px;
  margin: 10px auto;
  color: white;
  text-align: center;
  border-radius: 4px;

  a {
    text-decoration: underline;
  }
`;

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
        setUpdateAvailable(true);
      };

      wb.addEventListener("waiting", promptNewVersionAvailable);
      wb.addEventListener("installed", (event) => {
        plausible("Install");
      });

      wb.register();
    }
  }, []);

  return (
    <>
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
        <meta name="google" content="notranslate" />
      </Head>
      {updateAvailable ? (
        <Warning initial={{ y: -30 }} animate={{ y: 0 }}>
          <p>
            Er is een <strong>nieuwe versie</strong> van Woordje beschikbaar.
          </p>
          <p>
            Klik{" "}
            <a
              href="#reload"
              onClick={(e) => {
                e.preventDefault();
                window.location.reload();
              }}>
              hier
            </a>{" "}
            om deze te laden.
          </p>
        </Warning>
      ) : null}
    </>
  );
};

export default Pwa;
