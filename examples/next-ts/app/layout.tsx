"use client"

import "@styles/global.css"

import { dataAttr } from "@zag-js/dom-query"
import { componentRoutesData, getComponentByPath, isKnownComponent } from "@zag-js/shared"
import Link from "next/link"
import { useParams, usePathname } from "next/navigation"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/"
  const params = useParams<{ component?: string }>()
  const pathnameComponent = pathname.split("/").filter(Boolean)[0] ?? ""
  const routeComponent = typeof params?.component === "string" ? params.component : null
  const currentComponent =
    routeComponent ?? getComponentByPath(pathname) ?? (isKnownComponent(pathnameComponent) ? pathnameComponent : "")

  return (
    <html lang="en">
      <head>
        <title>React Machines</title>
      </head>
      <body>
        <div className="page">
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
          {children}
        </div>
      </body>
    </html>
  )
}
