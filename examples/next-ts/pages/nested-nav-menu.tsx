import * as navMenu from "@zag-js/nav-menu"
import { useMachine, normalizeProps } from "@zag-js/react"
import { nestedNavMenuData } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useEffectOnce } from "../hooks/use-effect-once"

export default function Page() {
  const [state, send, machine] = useMachine(navMenu.machine({ id: useId() }))
  const root = navMenu.connect(state, send, normalizeProps)

  const [subState, subSend, subMachine] = useMachine(navMenu.machine({ id: useId() }))
  const sub = navMenu.connect(subState, subSend, normalizeProps)

  useEffectOnce(() => {
    root.setChild(subMachine)
    sub.setParent(machine)
  })

  const getTriggerItemProps = (id: string) => root.getTriggerMenuItemProps(sub, id)

  return (
    <>
      <main className="nav-menu">
        <nav {...root.rootProps}>
          <ul style={{ display: "flex", listStyle: "none" }}>
            {nestedNavMenuData.map(({ menu, menuList }) => (
              <li key={menu.id} style={{ position: "relative" }}>
                <button data-testid={`${menu.id}:trigger`} {...root.getTriggerProps({ id: menu.id })}>
                  {menu.label} <span {...root.indicatorProps}>▾</span>
                </button>
                <div {...root.getPositionerProps({ id: menu.id })}>
                  <ul data-testid={`${menu.id}:content`} {...root.getContentProps({ id: menu.id })}>
                    {menuList.map((item) => {
                      const { id, label, href, subList } = item
                      const hasSubList = !!subList
                      return (
                        <li key={JSON.stringify(item)}>
                          {hasSubList ? (
                            <>
                              <button data-testid={`${id}:trigger`} {...getTriggerItemProps(id)}>
                                {label}
                                <span {...sub.indicatorProps}>→</span>
                              </button>
                              <div {...sub.getPositionerProps({ id })}>
                                <ul
                                  data-testid={`${id}:content`}
                                  {...sub.getContentProps({ id })}
                                  style={{ listStyle: "none" }}
                                >
                                  {subList.map((item) => (
                                    <li key={JSON.stringify(item)}>
                                      <a
                                        data-testid={`${item.id}:menu-item`}
                                        {...sub.getMenuItemProps({ id: item.id, href: item.href })}
                                      >
                                        {item.label}
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </>
                          ) : (
                            <a data-testid={`${item.id}:menu-item`} {...root.getMenuItemProps({ id, href })}>
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
        <StateVisualizer state={state} label="Root machine" />
        <StateVisualizer state={subState} label="Sub machine" />
      </Toolbar>
    </>
  )
}
