import PlausibleProvider from "next-plausible";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";
import store from "../redux/store";
import Seo from "../components/Seo";
import Pwa from "../components/Pwa";
import GlobalStyle from "../styles/globals";
import Loading from "../components/Loading";

let persistor = persistStore(store);

function MyApp({ Component, pageProps }) {
  return (
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
  );
}

export default MyApp;
