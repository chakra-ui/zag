import * as navMenu from "@zag-js/nav-menu"
import { useMachine, normalizeProps } from "@zag-js/react"
import { navMenuData } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default function Page() {
  const [state, send] = useMachine(navMenu.machine({ id: useId() }))

  const api = navMenu.connect(state, send, normalizeProps)

  return (
    <>
      <main className="nav-menu">
        <nav>
          <ul {...api.listProps}>
            {navMenuData.map((item) =>
              item.trigger ? (
                <li key={item.id} {...api.itemProps}>
                  <button data-testid={`${item.id}:trigger`} {...api.getTriggerProps({ id: item.id })}>
                    {item.label} <span {...api.indicatorProps}>▾</span>
                  </button>
                  <div data-testid={`${item.id}:content`} {...api.getContentProps({ id: item.id })}>
                    <ul {...api.linkContentGroupProps}>
                      {item.links?.map(({ label, id, href }) => (
                        <li key={id}>
                          <a data-testid={`${id}:link`} {...api.getLinkProps({ id })} href={href}>
                            {label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ) : (
                <li key={item.id} {...api.itemProps}>
                  <a data-testid={`${item.id}:link`} {...api.getLinkProps({ id: item.id })} href={item.href}>
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
      </Toolbar>
    </>
  )
}
