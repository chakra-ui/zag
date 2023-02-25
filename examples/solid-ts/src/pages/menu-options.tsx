import * as menu from "@zag-js/menu"
import { menuControls, menuOptionData as data } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId, For } from "solid-js"
import { Portal } from "solid-js/web"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(menuControls)

  const [state, send] = useMachine(
    menu.machine({
      id: createUniqueId(),
      value: { order: "", type: [] },
      onValueChange: console.log,
    }),
    {
      context: controls.context,
    },
  )

  const api = createMemo(() => menu.connect(state, send, normalizeProps))

  return (
    <>
      <main>
        <div>
          <button {...api().triggerProps}>
            Actions <span aria-hidden>▾</span>
          </button>

          <Portal>
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
          </Portal>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
