import * as navMenu from "@zag-js/nav-menu"
import { useMachine, normalizeProps } from "@zag-js/react"
import { nestNavMenuData } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useEffectOnce } from "../hooks/use-effect-once"

export default function Page() {
  const [state, send, machine] = useMachine(navMenu.machine({ id: useId() }))
  const root = navMenu.connect(state, send, normalizeProps)

  const librariesId = nestNavMenuData.find((item) => item.id === "libraries").id

  const [subState, subSend, subMachine] = useMachine(
    navMenu.machine({
      // Create a unique id that includes the parent content id
      id: useId(),
      orientation: "vertical",
    }),
  )
  const sub = navMenu.connect(subState, subSend, normalizeProps)

  useEffectOnce(() => {
    root.setChild(subMachine, librariesId)
    sub.setParent(machine)
  })

  return (
    <>
      <main className="nav-menu">
        <nav>
          <ul {...root.listProps}>
            {nestNavMenuData.map((item) =>
              item.trigger ? (
                <li key={item.id} {...root.itemProps}>
                  <button data-testid={`${item.id}:trigger`} {...root.getTriggerProps({ id: item.id })}>
                    {item.label} <span {...root.indicatorProps}>▾</span>
                  </button>
                  <div data-testid={`${item.id}:content`} {...root.getContentProps({ id: item.id })}>
                    {/* TODO: Sub Machine starts here */}
                    {item.subMenu ? (
                      <ul {...sub.listProps}>
                        {item.subMenu.map((subItem) =>
                          subItem.trigger ? (
                            <li key={subItem.id} {...sub.itemProps}>
                              <button data-testid={`${subItem.id}`} {...sub.getTriggerProps({ id: subItem.id })}>
                                {subItem.label}
                              </button>
                              <div data-testid={`${subItem.id}:content`} {...sub.getContentProps({ id: subItem.id })}>
                                <ul {...sub.linkContentGroupProps}>
                                  {subItem.links?.map(({ label, id, href }) => (
                                    <li key={id}>
                                      <a data-testid={`${id}:link`} {...sub.getLinkProps({ id })} href={href}>
                                        {label}
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </li>
                          ) : (
                            <li key={subItem.id} {...sub.itemProps}>
                              <a
                                data-testid={`${subItem.id}:link`}
                                {...sub.getLinkProps({ id: subItem.id })}
                                href={item.href}
                              >
                                {subItem.label}
                              </a>
                            </li>
                          ),
                        )}
                      </ul>
                    ) : (
                      <ul {...root.linkContentGroupProps}>
                        {item.links?.map(({ label, id, href }) => (
                          <li key={id}>
                            <a data-testid={`${id}:link`} {...root.getLinkProps({ id })} href={href}>
                              {label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              ) : (
                <li key={item.id} {...root.itemProps}>
                  <a data-testid={`${item.id}:link`} {...root.getLinkProps({ id: item.id })} href={item.href}>
                    {item.label}
                  </a>
                </li>
              ),
            )}
          </ul>
        </nav>
      </main>

      <Toolbar>
        <StateVisualizer state={state} />
        <StateVisualizer state={subState} />
      </Toolbar>
    </>
  )
}
