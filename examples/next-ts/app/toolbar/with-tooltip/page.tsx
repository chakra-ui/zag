"use client"

import { mergeProps, normalizeProps, Portal, useMachine } from "@zag-js/react"
import * as tooltip from "@zag-js/tooltip"
import * as toolbar from "@zag-js/toolbar"
import { useId } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar as ControlsPanel } from "@/components/toolbar"
import "@styles/toolbar.css"
import "@styles/tooltip.css"

function IconButton(props: { api: toolbar.Api; value: string; label: string; children: React.ReactNode }) {
  const { api, value, label, children } = props
  const triggerId = api.getItemId(value)

  const service = useMachine(tooltip.machine, {
    id: useId(),
    ids: { trigger: triggerId },
    disabled: api.disabled,
  })
  const tooltipApi = tooltip.connect(service, normalizeProps)

  return (
    <>
      <button
        className="toolbar-icon-only"
        {...mergeProps(tooltipApi.getTriggerProps(), api.getItemProps({ value }))}
        aria-label={label}
      >
        {children}
      </button>
      {tooltipApi.open && (
        <Portal>
          <div {...tooltipApi.getPositionerProps()}>
            <div {...tooltipApi.getContentProps()}>{label}</div>
          </div>
        </Portal>
      )}
    </>
  )
}

export default function Page() {
  const service = useMachine(toolbar.machine, { id: useId() })
  const api = toolbar.connect(service, normalizeProps)

  return (
    <>
      <main className="toolbar">
        <div {...api.getRootProps()}>
          <IconButton api={api} value="bold" label="Bold">
            <strong>B</strong>
          </IconButton>
          <IconButton api={api} value="italic" label="Italic">
            <em>I</em>
          </IconButton>
          <IconButton api={api} value="underline" label="Underline">
            <u>U</u>
          </IconButton>
        </div>
        <p>Hover or focus an icon button to see its tooltip. Arrow keys still move roving focus normally.</p>
      </main>

      <ControlsPanel>
        <StateVisualizer state={service} />
      </ControlsPanel>
    </>
  )
}
