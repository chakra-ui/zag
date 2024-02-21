import * as navMenu from "@zag-js/nav-menu"
import { navMenuControls, navMenuData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"
import { computed, defineComponent } from "vue"

export default defineComponent({
  name: "nav-menu",
  setup() {
    const controls = useControls(navMenuControls)

    const [state, send] = useMachine(navMenu.machine({ id: "1" }), { context: controls.context })

    const apiRef = computed(() => navMenu.connect(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value

      return (
        <>
          <main class="nav-menu">
            <nav {...api.rootProps}>
              <ul style={{ display: "flex", listStyle: "none" }}>
                {navMenuData.map(({ menu, menuList }) => (
                  <li key={menu.id}>
                    <button {...api.getTriggerProps({ id: menu.id })}>
                      {menu.label} <span {...api.indicatorProps}>▾</span>
                    </button>
                    <div {...api.getPositionerProps({ id: menu.id })}>
                      <ul {...api.getContentProps({ id: menu.id })} style={{ listStyle: "none" }}>
                        {menuList.map((item) => (
                          <li key={JSON.stringify(item)}>
                            <a {...api.getMenuItemProps({ id: item.id, href: item.href })}>{item.label}</a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                ))}
              </ul>
            </nav>
          </main>

          <Toolbar controls={controls.ui}>
            <StateVisualizer state={state} />
          </Toolbar>
        </>
      )
    }
  },
})
