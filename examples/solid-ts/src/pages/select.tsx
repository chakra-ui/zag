import * as select from "@zag-js/select"
import { selectControls, selectData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import serialize from "form-serialize"
import { Index, createMemo, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

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
        <div {...api().rootProps}>
          {/* control */}
          <div {...api().controlProps}>
            <label {...api().labelProps}>Label</label>
            <button {...api().triggerProps}>
              {api().valueAsString || "Select option"}
              <span {...api().indicatorProps}>▼</span>
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
              <Index each={selectData}>{(option) => <option value={option().value}>{option().label}</option>}</Index>
            </select>
          </form>

          {/* UI select */}
          <Portal>
            <div {...api().positionerProps}>
              <ul {...api().contentProps}>
                <Index each={selectData}>
                  {(item) => (
                    <li {...api().getItemProps({ item: item() })}>
                      <span {...api().getItemTextProps({ item: item() })}>{item().label}</span>
                      <span {...api().getItemIndicatorProps({ item: item() })}>✓</span>
                    </li>
                  )}
                </Index>
              </ul>
            </div>
          </Portal>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} omit={["collection"]} />
      </Toolbar>
    </>
  )
}
