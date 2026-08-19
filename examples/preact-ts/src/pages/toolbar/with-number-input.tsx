import { mergeProps, normalizeProps, useMachine } from "@zag-js/preact"
import * as numberInput from "@zag-js/number-input"
import * as toolbar from "@zag-js/toolbar"
import { useId } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar as ControlsPanel } from "../../components/toolbar"

function ZoomInput(props: { api: toolbar.Api }) {
  const { api } = props
  const service = useMachine(numberInput.machine, {
    id: useId(),
    ids: { input: api.getItemId("zoom") },
    disabled: api.disabled,
    defaultValue: "100",
    min: 25,
    max: 400,
    step: 25,
  })
  const numberApi = numberInput.connect(service, normalizeProps)

  return (
    <div {...numberApi.getControlProps()}>
      <button {...numberApi.getDecrementTriggerProps()} aria-label="Zoom out">
        -
      </button>
      <input
        class="toolbar-number-input"
        {...mergeProps(numberApi.getInputProps(), api.getInputProps({ value: "zoom" }))}
      />
      <button {...numberApi.getIncrementTriggerProps()} aria-label="Zoom in">
        +
      </button>
    </div>
  )
}

export default function Page() {
  const service = useMachine(toolbar.machine, { id: useId(), orientation: "vertical" })
  const api = toolbar.connect(service, normalizeProps)

  return (
    <>
      <main class="toolbar">
        <div {...api.getRootProps()}>
          <button {...api.getItemProps({ value: "cut" })}>Cut</button>
          <button {...api.getItemProps({ value: "copy" })}>Copy</button>
          <div {...api.getSeparatorProps()} />
          <ZoomInput api={api} />
        </div>
      </main>

      <ControlsPanel>
        <StateVisualizer state={service} />
      </ControlsPanel>
    </>
  )
}
