import * as navMenu from "@zag-js/nav-menu"
import { nestedNavMenuData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { computed, defineComponent, onMounted } from "vue"

export default defineComponent({
  name: "nested-nav-menu",
  setup() {
    const [state, send, machine] = useMachine(navMenu.machine({ id: "1" }))
    const root = computed(() => navMenu.connect(state.value, send, normalizeProps))

    const [subState, subSend, subMachine] = useMachine(navMenu.machine({ id: "2" }))
    const sub = computed(() => navMenu.connect(subState.value, subSend, normalizeProps))

    onMounted(() => {
      root.value.setChild(subMachine)
      sub.value.setParent(machine)
    })

    const getTriggerItemProps = (id: string) => computed(() => root.value.getTriggerMenuItemProps(sub.value, id))

    return () => {
      return (
        <>
          <main class="nav-menu">
            <nav {...root.value.rootProps}>
              <ul style={{ display: "flex", listStyle: "none" }}>
                {nestedNavMenuData.map(({ menu, menuList }) => (
                  <li key={menu.id}>
                    <button data-testid={`${menu.id}:trigger`} {...root.value.getTriggerProps({ id: menu.id })}>
                      {menu.label} <span {...root.value.indicatorProps}>▾</span>
                    </button>
                    <div {...root.value.getPositionerProps({ id: menu.id })}>
                      <ul data-testid={`${menu.id}:content`} {...root.value.getContentProps({ id: menu.id })}>
                        {menuList.map((item) => {
                          const { id, label, href, subList } = item
                          const hasSubList = !!subList
                          return (
                            <li key={JSON.stringify(item)}>
                              {hasSubList ? (
                                <>
                                  <button data-testid={`${id}:trigger`} {...getTriggerItemProps(id).value}>
                                    {label}
                                    <span {...sub.value.indicatorProps}>→</span>
                                  </button>
                                  <ul
                                    data-testid={`${id}:content`}
                                    {...sub.value.getContentProps({ id })}
                                    style={{ listStyle: "none" }}
                                  >
                                    {subList.map((item) => (
                                      <li key={JSON.stringify(item)}>
                                        <a
                                          data-testid={`${item.id}:menu-item`}
                                          {...sub.value.getMenuItemProps({ id: item.id, href: item.href })}
                                        >
                                          {item.label}
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                </>
                              ) : (
                                <a
                                  data-testid={`${item.id}:menu-item`}
                                  {...root.value.getMenuItemProps({ id, href: href! })}
                                >
                                  {label}
                                </a>
                              )}
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  </li>
                ))}
              </ul>
            </nav>
          </main>

          <Toolbar controls={null}>
            <StateVisualizer state={state} />
            <StateVisualizer state={subState} />
          </Toolbar>
        </>
      )
    }
  },
})
