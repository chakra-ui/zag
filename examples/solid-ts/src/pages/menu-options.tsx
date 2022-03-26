import { injectGlobal } from "@emotion/css"
import * as Menu from "@ui-machines/menu"
import { normalizeProps, PropTypes, useMachine, useSetup } from "@ui-machines/solid"
import { menuStyle } from "../../../../shared/style"
import { menuOptionData as data } from "../../../../shared/data"
import { StateVisualizer } from "../components/state-visualizer"
import { createMemo, For } from "solid-js"

injectGlobal(menuStyle)

export default function Page() {
  const [state, send] = useMachine(
    Menu.machine.withContext({
      values: { order: "", type: [] },
      onValuesChange: console.log,
    }),
  )
  const ref = useSetup<HTMLButtonElement>({ send, id: "1" })
  const api = createMemo(() => Menu.connect<PropTypes>(state, send, normalizeProps))

  return (
    <>
      <div>
        <button className="menu__trigger" ref={ref} {...api().triggerProps}>
          Actions <span aria-hidden>▾</span>
        </button>
        <div {...api().positionerProps}>
          <div className="menu__content" {...api().contentProps}>
            <For each={data.order}>
              {(item) => {
                const opts = { type: "radio", name: "order", value: item.id } as const
                return (
                  <div className="menu__item" {...api().getOptionItemProps(opts)}>
                    {api().isOptionChecked(opts) ? "✅" : null} {item.label}
                  </div>
                )
              }}
            </For>
            <hr />
            <For each={data.type}>
              {(item) => {
                const opts = { type: "checkbox", name: "type", value: item.id } as const
                return (
                  <div className="menu__item" {...api().getOptionItemProps(opts)}>
                    {api().isOptionChecked(opts) ? "✅" : null} {item.label}
                  </div>
                )
              }}
            </For>
          </div>
        </div>
      </div>

      <StateVisualizer state={state} />
    </>
  )
}
