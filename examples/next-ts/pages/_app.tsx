import { dataAttr } from "@zag-js/dom-utils"
import { AppProps } from "next/app"
import Head from "next/head"
import Link from "next/link"
import "../../../shared/reset"
import { routesData } from "../../../shared/routes"
import { navStyle, pageStyle } from "../../../shared/style"

export default function App({ Component, pageProps, router }: AppProps) {
  return (
    <div className={pageStyle}>
      <Head>
        <title>React Machines</title>
      </Head>

      <aside className={navStyle}>
        <header>Zagjs</header>
        {routesData.map((route) => {
          const active = router.pathname === route.path
          return (
            <Link href={route.path} key={route.label} passHref>
              <a data-active={dataAttr(active)}>{route.label}</a>
            </Link>
          )
        })}
      </aside>
      <Component {...pageProps} />
    </div>
  )
}
