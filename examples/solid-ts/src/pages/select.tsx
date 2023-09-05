import * as select from "@zag-js/select"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId, For } from "solid-js"
import { Portal } from "solid-js/web"
import { selectControls, selectData } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"
import serialize from "form-serialize"

export default function Page() {
  const controls = useControls(selectControls)

  const [state, send] = useMachine(
    select.machine({
      collection: select.collection({ items: selectData }),
      id: createUniqueId(),
    }),
    {
      context: controls.context,
    },
  )

  const api = createMemo(() => select.connect(state, send, normalizeProps))

  return (
    <>
      <main class="select">
        {/* control */}
        <div class="control">
          <label {...api().labelProps}>Label</label>
          <button {...api().triggerProps}>
            {api().valueAsString || "Select option"}
            <span>▼</span>
          </button>
        </div>

        <form
          onInput={(e) => {
            const form = e.currentTarget as HTMLFormElement
            const formData = serialize(form, { hash: true })
            console.log(formData)
          }}
        >
          {/* Hidden select */}
          <select {...api().hiddenSelectProps}>
            <For each={selectData}>{(option) => <option value={option.value}>{option.label}</option>}</For>
          </select>
        </form>

        {/* UI select */}
        <Portal>
          <div {...api().positionerProps}>
            <ul {...api().contentProps}>
              <For each={selectData}>
                {(item) => (
                  <li {...api().getItemProps({ item })}>
                    <span class="item-label">{item.label}</span>
                    <span {...api().getItemIndicatorProps({ item })}>✓</span>
                  </li>
                )}
              </For>
            </ul>
          </div>
        </Portal>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} omit={["collection"]} />
      </Toolbar>
    </>
  )
}
