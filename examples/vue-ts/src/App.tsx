import { RouterView, RouterLink, useRouter } from "vue-router"
import { h, Fragment } from "vue"
import { routesData } from "@zag-js/shared"
import { navStyle, pageStyle } from "@zag-js/shared"
import { dataAttr } from "@zag-js/dom-utils"

export default function App() {
  const router = useRouter()
  let pathname = router.currentRoute.value.path

  return (
    <div class={pageStyle}>
      <aside class={navStyle}>
        <header>Zagjs</header>
        {routesData.map((route) => {
          const active = pathname === route.path
          return (
            <RouterLink data-active={dataAttr(active)} to={route.path} key={route.label}>
              {() => route.label}
            </RouterLink>
          )
        })}
      </aside>
      <RouterView />
    </div>
  )
}
