import Document, { Html, Head, Main, NextScript } from "next/document";
import { CssBaseline } from "@nextui-org/react";
import { getCssText } from "../styles/stitches.config";

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
