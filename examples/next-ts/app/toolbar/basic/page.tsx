"use client"

import { mergeProps, normalizeProps, Portal, useMachine } from "@zag-js/react"
import * as select from "@zag-js/select"
import { toolbarControls, toolbarData } from "@zag-js/shared"
import * as toggleGroup from "@zag-js/toggle-group"
import * as toolbar from "@zag-js/toolbar"
import { useId } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar as ControlsPanel } from "@/components/toolbar"
import { useControls } from "@/hooks/use-controls"
import "@styles/toolbar.css"
import "@styles/toggle-group.css"
import "@styles/select.css"

interface Font {
  label: string
  value: string
}

const fonts: Font[] = [
  { label: "Helvetica", value: "helvetica" },
  { label: "Arial", value: "arial" },
  { label: "Georgia", value: "georgia" },
]

function AlignmentGroup(props: { api: toolbar.Api }) {
  const { api: toolbarApi } = props
  const service = useMachine(toggleGroup.machine, {
    id: useId(),
    disabled: toolbarApi.disabled,
    orientation: toolbarApi.orientation,
    defaultValue: ["left"],
  })
  const api = toggleGroup.connect(service, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <button {...api.getItemProps({ value: "left" })} aria-label="Align left">
        ⯇
      </button>
      <button {...api.getItemProps({ value: "right" })} aria-label="Align right">
        ⯈
      </button>
    </div>
  )
}

function ClipboardGroup(props: { api: toolbar.Api }) {
  const { api } = props
  return (
    <div {...api.getGroupProps({ value: "clipboard" })}>
      {toolbarData.map((item) => (
        <button key={item.id} {...api.getItemProps({ value: item.id })}>
          {item.label}
        </button>
      ))}
    </div>
  )
}

function FontPicker(props: { api: toolbar.Api }) {
  const { api } = props
  const triggerId = api.getItemId("font")

  const service = useMachine(select.machine as select.Machine<Font>, {
    id: useId(),
    ids: { trigger: triggerId },
    collection: select.collection({ items: fonts }),
    disabled: api.disabled,
    defaultValue: ["helvetica"],
  })
  const fontApi = select.connect(service, normalizeProps)

  return (
    <>
      <button {...mergeProps(fontApi.getTriggerProps(), api.getItemProps({ value: "font" }))}>
        <span>{fontApi.valueAsString || "Font"}</span>
        <span aria-hidden>▾</span>
      </button>
      <Portal>
        <div {...fontApi.getPositionerProps()}>
          <div {...fontApi.getContentProps()}>
            <ul {...fontApi.getListProps()}>
              {fonts.map((item) => (
                <li key={item.value} {...fontApi.getItemProps({ item })}>
                  <span {...fontApi.getItemTextProps({ item })}>{item.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Portal>
    </>
  )
}

export default function Page() {
  const controls = useControls(toolbarControls)

  const service = useMachine(toolbar.machine, {
    id: useId(),
    ...controls.context,
  })
  const api = toolbar.connect(service, normalizeProps)

  return (
    <>
      <main className="toolbar">
        <div {...api.getRootProps()}>
          <AlignmentGroup api={api} />

          <div {...api.getSeparatorProps()} />

          <ClipboardGroup api={api} />

          <div {...api.getSeparatorProps()} />

          <FontPicker api={api} />

          <div {...api.getSeparatorProps()} />

          <a {...api.getLinkProps({ value: "edited" })} href="https://zagjs.com" target="_blank" rel="noreferrer">
            Edited 51m ago
          </a>
        </div>
      </main>

      <ControlsPanel controls={controls.ui}>
        <StateVisualizer state={service} context={["focusedValue"]} />
      </ControlsPanel>
    </>
  )
}
