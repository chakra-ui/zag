import * as navMenu from "@zag-js/nav-menu"
import { useMachine, normalizeProps } from "@zag-js/react"
import { navMenuControls, navMenuData } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(navMenuControls)

  const [state, send] = useMachine(navMenu.machine({ id: useId() }), {
    context: {
      positioning: {
        fitViewport: true,
        gutter: 8,
      },
      ...controls.context,
    },
  })

  const api = navMenu.connect(state, send, normalizeProps)

  return (
    <>
      <main className="nav-menu">
        <nav {...api.rootProps}>
          <ul>
            {navMenuData.map(({ menu, menuList }) => (
              <li key={menu.id} style={{ position: "relative" }}>
                <button data-testid={`${menu.id}:trigger`} {...api.getTriggerProps({ id: menu.id })}>
                  {menu.label} <span {...api.indicatorProps}>▾</span>
                </button>
                <div {...api.getPositionerProps({ id: menu.id })}>
                  <ul
                    data-testid={`${menu.id}:content`}
                    {...api.getContentProps({ id: menu.id })}
                    style={{ listStyle: "none" }}
                  >
                    {menuList.map((item) => (
                      <li key={JSON.stringify(item)}>
                        <a
                          data-testid={`${item.id}:menu-item`}
                          {...api.getMenuItemProps({ id: item.id, href: item.href })}
                        >
                          {item.label}
                        </a>
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
