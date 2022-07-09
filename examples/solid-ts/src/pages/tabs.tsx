import { injectGlobal } from "@emotion/css"
import { normalizeProps, useMachine } from "@zag-js/solid"
import * as tabs from "@zag-js/tabs"
import { createMemo, createUniqueId, For } from "solid-js"
import { tabsControls, tabsData, tabsStyle } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

injectGlobal(tabsStyle)

export default function Page() {
  const controls = useControls(tabsControls)

  const [state, send] = useMachine(tabs.machine({ id: createUniqueId(), value: "nils" }), {
    context: controls.context,
  })

  const api = createMemo(() => tabs.connect(state, send, normalizeProps))

  return (
    <>
      <main>
        <div {...api().rootProps}>
          <div {...api().indicatorProps} />

          <div {...api().triggerGroupProps}>
            <For each={tabsData}>
              {(item) => (
                <button data-testid={`${item.id}-tab`} {...api().getTriggerProps({ value: item.id })}>
                  {item.label}
                </button>
              )}
            </For>
          </div>

          <div {...api().contentGroupProps}>
            <For each={tabsData}>
              {(item) => (
                <div data-testid={`${item.id}-tab-panel`} {...api().getContentProps({ value: item.id })}>
                  <p>{item.content}</p>
                  {item.id === "agnes" ? <input placeholder="Agnes" /> : null}
                </div>
              )}
            </For>
          </div>
        </div>
      </main>

      <Toolbar controls={controls.ui} visualizer={<StateVisualizer state={state} />} />
    </>
  )
}
