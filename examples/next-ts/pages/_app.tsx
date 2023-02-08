import { dataAttr } from "@zag-js/dom-utils"
import { routesData } from "@zag-js/shared"
import "@zag-js/shared/src/style.css"
import { AppProps } from "next/app"
import Head from "next/head"
import Link from "next/link"

export default function App({ Component, pageProps, router }: AppProps) {
  return (
    <div className="page">
      <Head>
        <title>React Machines</title>
      </Head>

      <aside className="nav">
        <header>Zagjs</header>
        {routesData
          .sort((a, b) => a.label.localeCompare(b.label))
          .map((route) => {
            const active = router.pathname === route.path
            return (
              <Link data-active={dataAttr(active)} href={route.path} key={route.label} passHref>
                {route.label}
              </Link>
            )
          })}
      </aside>
      <Component {...pageProps} />
    </div>
  )
}
