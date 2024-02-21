import * as navMenu from "@zag-js/nav-menu"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId, For } from "solid-js"
import { navMenuControls, navMenuData } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(navMenuControls)

  const [state, send] = useMachine(navMenu.machine({ id: createUniqueId() }), {
    context: controls.context,
  })

  const api = createMemo(() => navMenu.connect(state, send, normalizeProps))

  return (
    <>
      <main class="nav-menu">
        <nav {...api().rootProps}>
          <ul style={{ display: "flex", "list-style": "none" }}>
            <For each={navMenuData}>
              {({ menu, menuList }) => (
                <li>
                  <button {...api().getTriggerProps({ id: menu.id })}>
                    {menu.label} <span {...api().indicatorProps}>▾</span>
                  </button>
                  <div {...api().getPositionerProps({ id: menu.id })}>
                    <ul {...api().getContentProps({ id: menu.id })} style={{ "list-style": "none" }}>
                      <For each={menuList}>
                        {(item) => (
                          <li>
                            <a href={item.href} {...api().getMenuItemProps({ id: item.id })}>
                              {item.label}
                            </a>
                          </li>
                        )}
                      </For>
                    </ul>
                  </div>
                </li>
              )}
            </For>
          </ul>
        </nav>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
