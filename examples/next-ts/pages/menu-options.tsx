import { Global } from "@emotion/react"
import * as menu from "@zag-js/menu"
import { useMachine, useSetup } from "@zag-js/react"
import { menuStyle } from "../../../shared/style"
import { menuOptionData as data } from "../../../shared/data"
import { StateVisualizer } from "../components/state-visualizer"

export default function Page() {
  const [state, send] = useMachine(
    menu.machine.withContext({
      values: { order: "", type: [] },
      onValuesChange: console.log,
    }),
  )
  const ref = useSetup<HTMLButtonElement>({ send, id: "1" })
  const api = menu.connect(state, send)

  return (
    <>
      <Global styles={menuStyle} />

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

      <StateVisualizer state={state} />
    </>
  )
}
