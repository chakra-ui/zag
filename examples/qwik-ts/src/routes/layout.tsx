import { component$, Slot } from "@builder.io/qwik"
import { Link, useLocation, type DocumentHead, type RequestHandler } from "@builder.io/qwik-city"
import { routesData } from "@zag-js/shared"
import "@zag-js/shared/src/style.css"
import { dataAttr } from "@zag-js/dom-query"

export const onGet: RequestHandler = async ({ cacheControl }) => {
  // Control caching for this request for best performance and to reduce hosting costs:
  // https://qwik.dev/docs/caching/
  cacheControl({
    // Always serve a cached response by default, up to a week stale
    staleWhileRevalidate: 60 * 60 * 24 * 7,
    // Max once every 5 seconds, revalidate on the server to get a fresh version of this page
    maxAge: 5,
  })
}

export default component$(() => {
  const location = useLocation()

  return (
    <div class="page">
      <aside class="nav">
        <header>Zagjs</header>
        {routesData
          .sort((a, b) => a.label.localeCompare(b.label))
          .map((route) => {
            const active = location.url.pathname === route.path + "/"
            return (
              <Link data-active={dataAttr(active)} href={route.path} key={route.label}>
                {route.label}
              </Link>
            )
          })}
      </aside>
      <Slot />
    </div>
  )
})

export const head: DocumentHead = {
  title: "Qwik Machines",
}
