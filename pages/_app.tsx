import "../styles/globals.css";
import type { AppProps } from "next/app";
import Layout from "../components/Layout";
import Head from "next/head";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  // Nu mobile POC and /journey pages render full-screen without the sidebar Layout.
  const isFullScreen =
    router.pathname.startsWith("/nu") || router.pathname.startsWith("/journey");

  return (
    <>
      <Head>
        <title>Habitnu × Lilly — GLP-1 Population Intelligence</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="GLP-1 Population Analytics Platform — Habitnu × Lilly POC" />
      </Head>
      {isFullScreen ? (
        <Component {...pageProps} />
      ) : (
        <Layout>
          <Component {...pageProps} />
        </Layout>
      )}
    </>
  );
}
