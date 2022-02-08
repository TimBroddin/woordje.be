import PlausibleProvider from "next-plausible";
import { Provider } from "react-redux";
import { createTheme, NextUIProvider } from "@nextui-org/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";
import store from "../redux/store";
import Seo from "../components/Seo";
import Pwa from "../components/Pwa";
import GlobalStyle from "../styles/globals";
import Loading from "../components/Loading";

let persistor = persistStore(store);

const lightTheme = createTheme({
  type: "light",
});

const darkTheme = createTheme({
  type: "dark",
});

function MyApp({ Component, pageProps }) {
  return (
    <NextThemesProvider
      defaultTheme="system"
      attribute="class"
      value={{
        light: lightTheme.className,
        dark: darkTheme.className,
      }}>
      <NextUIProvider>
        <PlausibleProvider domain="woordje.be">
          <Provider store={store}>
            <>
              <GlobalStyle />
              <Pwa />

              <Seo letters={pageProps?.WORD_LENGTH} />
              <PersistGate loading={<Loading />} persistor={persistor}>
                <Component {...pageProps} />
              </PersistGate>
            </>
          </Provider>
        </PlausibleProvider>
      </NextUIProvider>
    </NextThemesProvider>
  );
}

export default MyApp;
