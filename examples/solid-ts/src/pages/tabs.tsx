import { injectGlobal } from "@emotion/css"
import { normalizeProps, PropTypes, useMachine, useSetup } from "@ui-machines/solid"
import * as Tabs from "@ui-machines/tabs"
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

  const ref = useSetup<HTMLDivElement>({ send, id: createUniqueId() })

  const api = createMemo(() => Tabs.connect<PropTypes>(state, send, normalizeProps))

  return (
    <div style={{ width: "100%" }}>
      <controls.ui />
      <div className="tabs" {...api().rootProps}>
        <div className="tabs__indicator" {...api().tabIndicatorProps} />
        <div ref={ref} {...api().tablistProps}>
          <For each={tabsData}>
            {(item) => (
              <button data-testid={`${item.id}-tab`} {...api().getTabProps({ value: item.id })}>
                {item.label}
              </button>
            )}
          </For>
        </div>
        <For each={tabsData}>
          {(item) => (
            <div data-testid={`${item.id}-tab-panel`} {...api().getTabPanelProps({ value: item.id })}>
              <p>{item.content}</p>
              {item.id === "agnes" ? <input placeholder="Agnes" /> : null}
            </div>
          )}
        </For>
      </div>

      <StateVisualizer state={state} />
    </div>
  )
}
