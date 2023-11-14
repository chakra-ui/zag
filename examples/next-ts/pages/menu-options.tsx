import * as menu from "@zag-js/menu"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { menuOptionData as data, menuControls } from "@zag-js/shared"
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
            Actions <span {...api.indicatorProps}>▾</span>
          </button>

          <Portal>
            <div {...api.positionerProps}>
              <div {...api.contentProps}>
                {data.order.map((item) => {
                  const opts = { type: "radio", name: "order", value: item.id } as const
                  return (
                    <div key={item.id} {...api.getOptionItemProps(opts)}>
                      <span {...api.getOptionItemIndicatorProps(opts)}>✅</span>
                      <span {...api.getOptionItemTextProps(opts)}>{item.label}</span>
                    </div>
                  )
                })}
                <hr />
                {data.type.map((item) => {
                  const opts = { type: "checkbox", name: "type", value: item.id } as const
                  return (
                    <div key={item.id} {...api.getOptionItemProps(opts)}>
                      <span {...api.getOptionItemIndicatorProps(opts)}>✅</span>
                      <span {...api.getOptionItemTextProps(opts)}>{item.label}</span>
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
