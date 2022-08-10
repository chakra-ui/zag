import { dataAttr } from "@zag-js/dom-utils"
import { routesData } from "@zag-js/shared"
import { computed, defineComponent } from "vue"
import { RouterLink, RouterView, useRouter } from "vue-router"

const App = defineComponent({
  name: "App",
  setup() {
    const router = useRouter()

    const items = computed(() =>
      routesData.map((route) => {
        const pathname = router.currentRoute.value.path
        const active = pathname === route.path
        return (
          <RouterLink data-active={dataAttr(active)} to={route.path} key={route.label}>
            {() => route.label}
          </RouterLink>
        )
      }),
    )

    return () => (
      <div class="page">
        <aside class="nav">
          <header>Zagjs</header>
          {items.value}
        </aside>
        <RouterView />
      </div>
    )
  },
})

export default App
