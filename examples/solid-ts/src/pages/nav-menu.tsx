import * as navMenu from "@zag-js/nav-menu"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import { navMenuData } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default function Page() {
  const [state, send] = useMachine(navMenu.machine({ id: createUniqueId() }))

  const api = createMemo(() => navMenu.connect(state, send, normalizeProps))

  return (
    <>
      <main class="nav-menu">
        <nav {...api().rootProps}>
          <ul {...api().listProps}>
            {navMenuData.map((item) =>
              item.trigger ? (
                <li {...api().itemProps}>
                  <button data-testid={`${item.id}:trigger`} {...api().getTriggerProps({ id: item.id })}>
                    {item.label} <span {...api().indicatorProps}>▾</span>
                  </button>
                  <div data-testid={`${item.id}:content`} {...api().getContentProps({ id: item.id })}>
                    <ul {...api().linkContentGroupProps}>
                      {item.links?.map(({ label, id, href }) => (
                        <li>
                          <a data-testid={`${id}:link`} {...api().getLinkProps({ id })} href={href}>
                            {label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ) : (
                <li {...api().itemProps}>
                  <a data-testid={`${item.id}:link`} {...api().getLinkProps({ id: item.id })} href={item.href}>
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
