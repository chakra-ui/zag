import * as menu from "@zag-js/menu"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { menuControls, menuOptionData as data } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(menuControls)

  const [state, send] = useMachine(
    menu.machine({
      id: useId(),
      value: { order: "", type: [] },
      onValueChange: console.log,
    }),
    { context: controls.context },
  )
  const api = menu.connect(state, send, normalizeProps)

  return (
    <>
      <main>
        <div>
          <button data-testid="trigger" {...api.triggerProps}>
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

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
