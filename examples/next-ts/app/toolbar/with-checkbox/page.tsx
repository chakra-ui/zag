"use client"

import { mergeProps, normalizeProps, useMachine } from "@zag-js/react"
import * as checkbox from "@zag-js/checkbox"
import * as toolbar from "@zag-js/toolbar"
import { useId } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar as ControlsPanel } from "@/components/toolbar"
import "@styles/toolbar.css"
import "@styles/checkbox.css"

function TrackChangesToggle(props: { api: toolbar.Api }) {
  const { api } = props
  const inputId = api.getItemId("track-changes")

  const service = useMachine(checkbox.machine, {
    id: useId(),
    ids: { hiddenInput: inputId },
    disabled: api.disabled,
  })
  const checkboxApi = checkbox.connect(service, normalizeProps)

  return (
    <label {...checkboxApi.getRootProps()} className="toolbar-item">
      <div {...checkboxApi.getControlProps()} />
      <input
        {...mergeProps(checkboxApi.getHiddenInputProps(), api.getItemProps({ value: "track-changes" }))}
        type="checkbox"
      />
      <span {...checkboxApi.getLabelProps()}>Track changes</span>
    </label>
  )
}

export default function Page() {
  const service = useMachine(toolbar.machine, { id: useId() })
  const api = toolbar.connect(service, normalizeProps)

  return (
    <>
      <main className="toolbar">
        <div {...api.getRootProps()}>
          <button {...api.getItemProps({ value: "cut" })}>Cut</button>
          <button {...api.getItemProps({ value: "copy" })}>Copy</button>

          <div {...api.getSeparatorProps()} />

          <TrackChangesToggle api={api} />
        </div>
      </main>

      <ControlsPanel>
        <StateVisualizer state={service} />
      </ControlsPanel>
    </>
  )
}
