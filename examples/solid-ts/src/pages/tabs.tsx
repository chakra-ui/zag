import { injectGlobal } from "@emotion/css"
import { normalizeProps, PropTypes, useMachine, useSetup } from "@zag-js/solid"
import * as Tabs from "@zag-js/tabs"
import { createMemo, createUniqueId, For } from "solid-js"
import { tabsControls } from "../../../../shared/controls"
import { tabsData } from "../../../../shared/data"
import { tabsStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"

injectGlobal(tabsStyle)

export default function Page() {
  const controls = useControls(tabsControls)

  const [state, send] = useMachine(Tabs.machine.withContext({ value: "nils" }), {
    context: controls.context,
  })

  const ref = useSetup({ send, id: createUniqueId() })

  const api = createMemo(() => Tabs.connect<PropTypes>(state, send, normalizeProps))

  return (
    <>
      <controls.ui />

      <div {...api().rootProps}>
        <div {...api().indicatorProps} />

        <div ref={ref} {...api().triggerGroupProps}>
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

      <StateVisualizer state={state} />
    </>
  )
}
