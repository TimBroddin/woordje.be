import PlausibleProvider from "next-plausible";
import { Provider } from "react-redux";
import { createTheme, NextUIProvider } from "@nextui-org/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import Head from "next/head";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";
import { useTranslations } from "@/lib/i18n";
import store from "@/redux/store";
import Pwa from "@/components/Pwa";
import globaStyles from "../styles/globals";
import GlobalStyle from "../styles/globals";
import useSWR, { SWRConfig } from "swr";
import { request } from "graphql-request";
import { LazyMotion, domAnimation } from "framer-motion";
import PoweredByVercel from "@/components/PoweredByVercel";
import "../styles/globals.css";

let persistor = persistStore(store);

const lightTheme = createTheme({
  type: "light",
});

const darkTheme = createTheme({
  type: "dark",
});

const Gate = ({ children }) => {
  <PersistGate persistor={persistor}>{children}</PersistGate>;
};

function MyApp({ Component, pageProps }) {
  const translations = useTranslations();
  GlobalStyle();
  return (
    <LazyMotion features={domAnimation}>
      <NextThemesProvider
        defaultTheme="system"
        attribute="class"
        value={{
          light: lightTheme.className,
          dark: darkTheme.className,
        }}
      >
        <NextUIProvider>
          <Head>
            <link
              rel="alternate"
              hrefLang={translations.alternate_lang}
              href={translations.alternate_url}
            />
          </Head>
          <PlausibleProvider
            domain={translations.plausible}
            customDomain="https://stats.broddin.be"
          >
            <Provider store={store}>
              <>
                <Pwa />

                <PersistGate persistor={persistor}>
                  <SWRConfig
                    value={{
                      revalidateOnFocus: false,
                      fetcher: ({ query, variables }) =>
                        request("/api/graphql", query, variables),
                    }}
                  >
                    <Component {...pageProps} />
                  </SWRConfig>
                </PersistGate>
              </>
            </Provider>
          </PlausibleProvider>
        </NextUIProvider>
      </NextThemesProvider>
    </LazyMotion>
  );
}

export default MyApp;
