import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import * as numberInput from "@zag-js/number-input"
import * as toolbar from "@zag-js/toolbar"
import { createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar as ControlsPanel } from "~/components/toolbar"
import "@styles/toolbar.css"

function ZoomInput(props: { api: () => toolbar.Api }) {
  const id = createUniqueId()
  const service = useMachine(numberInput.machine, () => ({
    id,
    ids: { input: props.api().getItemId("zoom") },
    disabled: props.api().disabled,
    defaultValue: "100",
    min: 25,
    max: 400,
    step: 25,
  }))
  const numberApi = createMemo(() => numberInput.connect(service, normalizeProps))

  return (
    <div {...numberApi().getControlProps()}>
      <button {...numberApi().getDecrementTriggerProps()} aria-label="Zoom out">
        -
      </button>
      <input
        class="toolbar-number-input"
        {...mergeProps(numberApi().getInputProps(), props.api().getInputProps({ value: "zoom" }))}
      />
      <button {...numberApi().getIncrementTriggerProps()} aria-label="Zoom in">
        +
      </button>
    </div>
  )
}

export default function Page() {
  const service = useMachine(toolbar.machine, { id: createUniqueId(), orientation: "vertical" })
  const api = createMemo(() => toolbar.connect(service, normalizeProps))

  return (
    <>
      <main class="toolbar">
        <div {...api().getRootProps()}>
          <button {...api().getItemProps({ value: "cut" })}>Cut</button>
          <button {...api().getItemProps({ value: "copy" })}>Copy</button>
          <div {...api().getSeparatorProps()} />
          <ZoomInput api={api} />
        </div>
      </main>

      <ControlsPanel viz>
        <StateVisualizer state={service} />
      </ControlsPanel>
    </>
  )
}
