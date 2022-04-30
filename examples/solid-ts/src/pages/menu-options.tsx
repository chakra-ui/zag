import { injectGlobal } from "@emotion/css"
import * as menu from "@zag-js/menu"
import { normalizeProps, PropTypes, useMachine, useSetup } from "@zag-js/solid"
import { menuStyle } from "../../../../shared/style"
import { menuOptionData as data } from "../../../../shared/data"
import { StateVisualizer } from "../components/state-visualizer"
import { createMemo, createUniqueId, For } from "solid-js"
import { Toolbar } from "../components/toolbar"

injectGlobal(menuStyle)

export default function Page() {
  const [state, send] = useMachine(
    menu.machine({
      values: { order: "", type: [] },
      onValuesChange: console.log,
    }),
  )
  const ref = useSetup<HTMLButtonElement>({ send, id: createUniqueId() })
  const api = createMemo(() => menu.connect<PropTypes>(state, send, normalizeProps))

  return (
    <>
      <main>
        <div>
          <button ref={ref} {...api().triggerProps}>
            Actions <span aria-hidden>▾</span>
          </button>
          <div {...api().positionerProps}>
            <div {...api().contentProps}>
              <For each={data.order}>
                {(item) => {
                  const opts = { type: "radio", name: "order", value: item.id } as const
                  return (
                    <div {...api().getOptionItemProps(opts)}>
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
                    <div {...api().getOptionItemProps(opts)}>
                      {api().isOptionChecked(opts) ? "✅" : null} {item.label}
                    </div>
                  )
                }}
              </For>
            </div>
          </div>
        </div>
      </main>

      <Toolbar controls={null} visualizer={<StateVisualizer state={state} />} />
    </>
  )
}
