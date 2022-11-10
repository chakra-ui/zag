import * as select from "@zag-js/select"
import { normalizeProps, useMachine, mergeProps } from "@zag-js/solid"
import { createMemo, createUniqueId, For } from "solid-js"
import { selectControls, selectData } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

const CaretIcon = () => (
  <svg
    stroke="currentColor"
    fill="currentColor"
    stroke-width="0"
    viewBox="0 0 1024 1024"
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M840.4 300H183.6c-19.7 0-30.7 20.8-18.5 35l328.4 380.8c9.4 10.9 27.5 10.9 37 0L858.9 335c12.2-14.2 1.2-35-18.5-35z"></path>
  </svg>
)

export default function Page() {
  const controls = useControls(selectControls)

  const [state, send] = useMachine(select.machine({ id: createUniqueId() }), {
    context: controls.context,
  })

  const api = createMemo(() => select.connect(state, send, normalizeProps))

  return (
    <>
      <main class="select">
        {/* control */}
        <div class="control">
          <label {...api().labelProps}>Label</label>
          <button {...api().triggerProps}>
            <span>{state.context.rendered}</span>
            <CaretIcon />
          </button>
        </div>

        {/* Hidden select */}
        <select {...api().selectProps}>
          <For each={selectData}>{(option) => <option value={option.value}>{option.label}</option>}</For>
        </select>

        {/* UI select */}
        <div {...api().positionerProps}>
          <ul {...api().menuProps}>
            <For each={selectData}>
              {({ label, value }) => (
                <li {...api().getOptionProps({ label, value })}>
                  <span>{label}</span>
                  {value === api().selectedOption?.value && "✓"}
                </li>
              )}
            </For>
          </ul>
        </div>
      </main>

      <Toolbar controls={controls.ui} visualizer={<StateVisualizer state={state} />} />
    </>
  )
}
