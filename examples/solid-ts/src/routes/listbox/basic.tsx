import styles from "../../../../../shared/src/css/listbox.module.css"
import * as listbox from "@zag-js/listbox"
import { listboxControls, selectData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"
import { createMemo, createUniqueId, For } from "solid-js"

interface Item {
  label: string
  value: string
}

export default function Page() {
  const controls = useControls(listboxControls)
  const collection = listbox.collection({ items: selectData })

  const service = useMachine(
    listbox.machine as listbox.Machine<Item>,
    controls.mergeProps({
      collection,
      id: createUniqueId(),
    }),
  )

  const api = createMemo(() => listbox.connect(service, normalizeProps))

  return (
    <>
      <main class="listbox">
        <div {...api().getRootProps()}>
          <label {...api().getLabelProps()} class={styles.Label}>Label {api().highlightedValue}</label>
          <ul {...api().getContentProps()} class={styles.Content}>
            <For each={selectData}>
              {(item) => (
                <li {...api().getItemProps({ item })} class={styles.Item}>
                  <span {...api().getItemTextProps({ item })} class={styles.ItemText}>{item.label}</span>
                  <span {...api().getItemIndicatorProps({ item })}>✓</span>
                </li>
              )}
            </For>
          </ul>
        </div>
      </main>

      <Toolbar controls={controls}>
        <StateVisualizer state={service} context={["highlightedValue", "focused"]} />
      </Toolbar>
    </>
  )
}
