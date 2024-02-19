import * as navMenu from "@zag-js/nav-menu"
import { useMachine, normalizeProps } from "@zag-js/react"
import { navMenuControls, navMenuData } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

const exampleStyles = {
  ul: {
    display: "flex",
  },
  li: {
    listStyle: "none",
  },
}

export default function Page() {
  const controls = useControls(navMenuControls)

  const [state, send] = useMachine(navMenu.machine({ id: useId() }), {
    context: controls.context,
  })

  const api = navMenu.connect(state, send, normalizeProps)

  return (
    <>
      <main className="nav-menu">
        <nav {...api.rootProps}>
          <ul style={{ ...exampleStyles.ul }}>
            {navMenuData.map(({ menu, menuList }) => (
              <li key={menu.id} style={{ ...exampleStyles.li }}>
                <button {...api.getTriggerProps({ id: menu.id })}>{menu.label}</button>
                <div {...api.getPositionerProps({ id: menu.id })}>
                  <ul {...api.getContentProps({ id: menu.id })}>
                    {menuList.map((item) => (
                      <li key={JSON.stringify(item)} style={{ ...exampleStyles.li }}>
                        <a href={item.href} {...api.getMenuItemProps({ id: item.id })}>
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
