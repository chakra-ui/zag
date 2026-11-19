import * as select from "@zag-js/select"
import { groupedData, selectControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { For, createMemo, createUniqueId } from "solid-js"
import { Portal } from "@solidjs/web"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"
import "@styles/select.css"

type Item = (typeof groupedData)[number]

export default function Page() {
  const controls = useControls(selectControls)

  const id = createUniqueId()
  const service = useMachine(
    select.machine as select.Machine<Item>,
    controls.mergeProps<select.Props<Item>>(() => ({
      collection: select.collection({ items: groupedData, groupBy: (item) => item.type }),
      id,
    })),
  )

  const api = createMemo(() => select.connect(service, normalizeProps))

  return (
    <>
      <main class="select">
        <div {...api().getRootProps()}>
          <label {...api().getLabelProps()}>Label</label>
          <div {...api().getControlProps()}>
            <button {...api().getTriggerProps()}>
              <span>{api().valueAsString || "Select option"}</span>
              <span {...api().getIndicatorProps()}>▼</span>
            </button>
            <button {...api().getClearTriggerProps()}>X</button>
          </div>

          <Portal>
            <div {...api().getPositionerProps()}>
              <div {...api().getContentProps()}>
                <div {...api().getListProps()}>
                  <For each={api().collection.group()}>
                    {([type, items]) => (
                      <div {...api().getItemGroupProps({ id: type })}>
                        <div {...api().getItemGroupLabelProps({ htmlFor: type })}>{type}</div>
                        <For each={items}>
                          {(item) => (
                            <div {...api().getItemProps({ item })}>
                              <span {...api().getItemTextProps({ item })}>{item.label}</span>
                              <span {...api().getItemIndicatorProps({ item })}>✓</span>
                            </div>
                          )}
                        </For>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            </div>
          </Portal>
        </div>
      </main>

      <Toolbar controls={controls}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
