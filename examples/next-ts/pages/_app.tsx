import { AppProps } from "next/app"
import Head from "next/head"
import "../../../shared/reset"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>React Machines</title>
      </Head>
      <Component {...pageProps} />
    </>
  )
}
