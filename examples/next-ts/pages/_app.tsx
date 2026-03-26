import { dataAttr } from "@zag-js/dom-query"
import { componentRoutesData, getComponentByPath, isKnownComponent } from "@zag-js/shared"
import "../../shared/styles/style.module.css"
import { AppProps } from "next/app"
import Head from "next/head"
import Link from "next/link"

export default function App({ Component, pageProps, router }: AppProps) {
  const pathname = router.asPath.split("?")[0] || "/"
  const pathnameComponent = pathname.split("/").filter(Boolean)[0] ?? ""
  const routeComponent =
    router.pathname === "/[component]" && router.query.component ? String(router.query.component) : null
  const currentComponent =
    routeComponent ?? getComponentByPath(pathname) ?? (isKnownComponent(pathnameComponent) ? pathnameComponent : "")

  return (
    <div className="page">
      <Head>
        <title>React Machines</title>
      </Head>

      <aside className="nav">
        <header>Zagjs</header>
        {componentRoutesData.map((component) => {
          const active = currentComponent === component.slug
          return (
            <Link data-active={dataAttr(active)} href={`/${component.slug}`} key={component.slug} passHref>
              {component.label}
            </Link>
          )
        })}
      </aside>
      <Component {...pageProps} />
    </div>
  )
}
