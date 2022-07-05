import { Global } from "@emotion/react"
import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine, useSetup } from "@zag-js/react"
import { menuOptionData as data, menuStyle } from "@zag-js/shared"
import { useId } from "react"
import { Portal } from "../components/portal"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default function Page() {
  const [state, send] = useMachine(
    menu.machine({
      value: { order: "", type: [] },
      onValueChange: console.log,
    }),
  )
  const ref = useSetup<HTMLButtonElement>({ send, id: useId() })
  const api = menu.connect(state, send, normalizeProps)

  return (
    <>
      <Global styles={menuStyle} />

      <main>
        <div>
          <button ref={ref} {...api.triggerProps}>
            Actions <span aria-hidden>▾</span>
          </button>

          <Portal>
            <div {...api.positionerProps}>
              <div {...api.contentProps}>
                {data.order.map((item) => {
                  const opts = { type: "radio", name: "order", value: item.id } as const
                  return (
                    <div key={item.id} {...api.getOptionItemProps(opts)}>
                      {api.isOptionChecked(opts) ? "✅" : null} {item.label}
                    </div>
                  )
                })}
                <hr />
                {data.type.map((item) => {
                  const opts = { type: "checkbox", name: "type", value: item.id } as const
                  return (
                    <div key={item.id} {...api.getOptionItemProps(opts)}>
                      {api.isOptionChecked(opts) ? "✅" : null} {item.label}
                    </div>
                  )
                })}
              </div>
            </div>
          </Portal>
        </div>
      </main>

      <Toolbar controls={null}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
