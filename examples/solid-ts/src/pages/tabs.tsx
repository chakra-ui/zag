import { injectGlobal } from "@emotion/css"
import { normalizeProps, SolidPropTypes, useMachine, useSetup } from "@ui-machines/solid"
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

  const tabs = createMemo(() => Tabs.connect<SolidPropTypes>(state, send, normalizeProps))

  return (
    <div style={{ width: "100%" }}>
      <controls.ui />
      <div className="tabs">
        <div className="tabs__indicator" {...tabs().tabIndicatorProps} />
        <div ref={ref} {...tabs().tablistProps}>
          <For each={tabsData}>
            {(item) => (
              <button data-testid={`${item.id}-tab`} {...tabs().getTabProps({ value: item.id })}>
                {item.label}
              </button>
            )}
          </For>
        </div>
        <For each={tabsData}>
          {(item) => (
            <div data-testid={`${item.id}-tab-panel`} {...tabs().getTabPanelProps({ value: item.id })}>
              <p>{item.content}</p>
            </div>
          )}
        </For>
      </div>

      <StateVisualizer state={state} />
    </div>
  )
}
