import Document, { Html, Head, Main, NextScript } from "next/document";
import { CssBaseline, getCssText } from "@nextui-org/react";

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="nl" translate="no">
        <Head>{CssBaseline.flush()}</Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
