"use client"

import { mergeProps, normalizeProps, useMachine } from "@zag-js/react"
import * as numberInput from "@zag-js/number-input"
import * as toolbar from "@zag-js/toolbar"
import { useId } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar as ControlsPanel } from "@/components/toolbar"
import "@styles/toolbar.css"

function ZoomInput(props: { api: toolbar.Api }) {
  const { api } = props
  const inputId = api.getItemId("zoom")

  const service = useMachine(numberInput.machine, {
    id: useId(),
    ids: { input: inputId },
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
        −
      </button>
      <input
        className="toolbar-number-input"
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
      <main className="toolbar">
        <div {...api.getRootProps()}>
          <button {...api.getItemProps({ value: "cut" })}>Cut</button>
          <button {...api.getItemProps({ value: "copy" })}>Copy</button>

          <div {...api.getSeparatorProps()} />

          <ZoomInput api={api} />
        </div>
        <p>
          A vertical toolbar contests ArrowUp/ArrowDown with the number-input&apos;s own spin behavior. Focus the zoom
          field and press ArrowUp/ArrowDown — it should always change the value, never move roving focus away.
          ArrowUp/ArrowDown still move between Cut/Copy/the field when focus is elsewhere.
        </p>
      </main>

      <ControlsPanel>
        <StateVisualizer state={service} />
      </ControlsPanel>
    </>
  )
}
