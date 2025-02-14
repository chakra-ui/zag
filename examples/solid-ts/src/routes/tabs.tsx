import { normalizeProps, useMachine } from "@zag-js/solid"
import * as tabs from "@zag-js/tabs"
import { createMemo, createUniqueId, For } from "solid-js"
import { tabsControls, tabsData } from "@zag-js/shared"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"

export default function Page() {
  const controls = useControls(tabsControls)

  const service = useMachine(tabs.machine, {
    id: createUniqueId(),
    defaultValue: "nils",
  })

  const api = createMemo(() => tabs.connect(service, normalizeProps))

  return (
    <>
      <main class="tabs">
        <div {...api().getRootProps()}>
          <div {...api().getIndicatorProps()} />

          <div {...api().getListProps()}>
            <For each={tabsData}>
              {(item) => (
                <button data-testid={`${item.id}-tab`} {...api().getTriggerProps({ value: item.id })}>
                  {item.label}
                </button>
              )}
            </For>
          </div>

          <For each={tabsData}>
            {(item) => (
              <div data-testid={`${item.id}-tab-panel`} {...api().getContentProps({ value: item.id })}>
                <p>{item.content}</p>
                {item.id === "agnes" ? <input placeholder="Agnes" /> : null}
              </div>
            )}
          </For>
        </div>
      </main>

      <Toolbar controls={controls}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
