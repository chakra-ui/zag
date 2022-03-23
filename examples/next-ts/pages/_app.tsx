import { AppProps } from "next/app"
import Head from "next/head"
import Link from "next/link"
import "../../../shared/reset"

export default function App({ Component, pageProps, router }: AppProps) {
  const isHome = router.asPath === "/"
  return (
    <>
      <Head>
        <title>React Machines</title>
      </Head>
      {!isHome && (
        <div className="backlink">
          <Link href="/">{"< Back"}</Link>
        </div>
      )}
      <Component {...pageProps} />
    </>
  )
}
