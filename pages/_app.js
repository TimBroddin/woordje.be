import "../styles/globals.css";
import PlausibleProvider from "next-plausible";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";
import store from "../redux/store";
import Seo from "../components/Seo";

let persistor = persistStore(store);

function MyApp({ Component, pageProps }) {
  return (
    <PlausibleProvider domain="woordje.be">
      <Provider store={store}>
        <>
          <Seo />
          <PersistGate loading={null} persistor={persistor}>
            <Component {...pageProps} />
          </PersistGate>
        </>
      </Provider>
    </PlausibleProvider>
  );
}

export default MyApp;
