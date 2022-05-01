import { Global } from "@emotion/react"
import * as menu from "@zag-js/menu"
import { useMachine, useSetup } from "@zag-js/react"
import { menuStyle } from "../../../shared/style"
import { menuOptionData as data } from "../../../shared/data"
import { StateVisualizer } from "../components/state-visualizer"
import { useId } from "react"
import { Toolbar } from "../components/toolbar"

export default function Page() {
  const [state, send] = useMachine(
    menu.machine({
      values: { order: "", type: [] },
      onValuesChange: console.log,
    }),
  )
  const ref = useSetup<HTMLButtonElement>({ send, id: useId() })
  const api = menu.connect(state, send)

  return (
    <>
      <Global styles={menuStyle} />

      <main>
        <div>
          <button ref={ref} {...api.triggerProps}>
            Actions <span aria-hidden>▾</span>
          </button>
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
        </div>
      </main>
      <Toolbar controls={null}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
