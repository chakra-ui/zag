import { RouterView, RouterLink, useRouter } from "vue-router"
import { h, Fragment } from "vue"
import { routesData } from "../../../shared/routes"
import { navStyle, pageStyle } from "../../../shared/style"
import { dataAttr } from "@zag-js/dom-utils"

export default function App() {
  const router = useRouter()
  let pathname = router.currentRoute.value.name

  return (
    <div class={pageStyle}>
      <aside class={navStyle}>
        <header>Zagjs</header>
        {routesData.map((route) => {
          const active = pathname === route.path
          return (
            <RouterLink data-active={dataAttr(active)} to={route.path} key={route.label}>
              {route.label}
            </RouterLink>
          )
        })}
      </aside>
      <RouterView />
    </div>
  )
}
