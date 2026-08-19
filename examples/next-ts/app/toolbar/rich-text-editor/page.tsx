"use client"

import { mergeProps, normalizeProps, Portal, useMachine } from "@zag-js/react"
import * as numberInput from "@zag-js/number-input"
import * as select from "@zag-js/select"
import * as toggleGroup from "@zag-js/toggle-group"
import * as toolbar from "@zag-js/toolbar"
import { useId, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar as ControlsPanel } from "@/components/toolbar"
import "@styles/toolbar.css"
import "@styles/toggle-group.css"
import "@styles/select.css"

interface Font {
  label: string
  value: string
}

const fonts: Font[] = [
  { label: "Sans-serif", value: "sans-serif" },
  { label: "Serif", value: "serif" },
  { label: "Monospace", value: "monospace" },
]

function FontPicker(props: { api: toolbar.Api; onChange: (value: string) => void }) {
  const { api, onChange } = props
  const triggerId = api.getItemId("font")

  const service = useMachine(select.machine as select.Machine<Font>, {
    id: useId(),
    ids: { trigger: triggerId },
    collection: select.collection({ items: fonts }),
    disabled: api.disabled,
    defaultValue: ["sans-serif"],
    onValueChange(details) {
      onChange(details.value[0])
    },
  })
  const fontApi = select.connect(service, normalizeProps)

  return (
    <>
      <button {...mergeProps(fontApi.getTriggerProps(), api.getItemProps({ value: "font" }))}>
        <span>{fontApi.valueAsString}</span>
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

function FontSizeInput(props: { api: toolbar.Api; onChange: (value: string) => void }) {
  const { api, onChange } = props
  const inputId = api.getItemId("font-size")

  const service = useMachine(numberInput.machine, {
    id: useId(),
    ids: { input: inputId },
    disabled: api.disabled,
    defaultValue: "16",
    min: 8,
    max: 96,
    onValueChange(details) {
      onChange(details.value)
    },
  })
  const numberApi = numberInput.connect(service, normalizeProps)

  return (
    <div {...numberApi.getControlProps()}>
      <button {...numberApi.getDecrementTriggerProps()} aria-label="Decrease font size">
        −
      </button>
      <input
        className="toolbar-number-input"
        {...mergeProps(numberApi.getInputProps(), api.getInputProps({ value: "font-size" }))}
      />
      <button {...numberApi.getIncrementTriggerProps()} aria-label="Increase font size">
        +
      </button>
    </div>
  )
}

function FormatToggles(props: { api: toolbar.Api; onChange: (value: string[]) => void }) {
  const service = useMachine(toggleGroup.machine, {
    id: useId(),
    disabled: props.api.disabled,
    orientation: props.api.orientation,
    multiple: true,
    defaultValue: [],
    onValueChange(details) {
      props.onChange(details.value)
    },
  })
  const api = toggleGroup.connect(service, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <button {...api.getItemProps({ value: "bold" })} aria-label="Bold">
        <strong>B</strong>
      </button>
      <button {...api.getItemProps({ value: "italic" })} aria-label="Italic">
        <em>I</em>
      </button>
      <button {...api.getItemProps({ value: "underline" })} aria-label="Underline">
        <u>U</u>
      </button>
    </div>
  )
}

function AlignmentToggles(props: { api: toolbar.Api; onChange: (value: string) => void }) {
  const service = useMachine(toggleGroup.machine, {
    id: useId(),
    disabled: props.api.disabled,
    orientation: props.api.orientation,
    defaultValue: ["left"],
    onValueChange(details) {
      if (details.value[0]) props.onChange(details.value[0])
    },
  })
  const api = toggleGroup.connect(service, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <button {...api.getItemProps({ value: "left" })} aria-label="Align left">
        ⯇
      </button>
      <button {...api.getItemProps({ value: "center" })} aria-label="Align center">
        ≡
      </button>
      <button {...api.getItemProps({ value: "right" })} aria-label="Align right">
        ⯈
      </button>
    </div>
  )
}

export default function Page() {
  const service = useMachine(toolbar.machine, { id: useId() })
  const api = toolbar.connect(service, normalizeProps)

  const [format, setFormat] = useState<string[]>([])
  const [align, setAlign] = useState("left")
  const [font, setFont] = useState("sans-serif")
  const [fontSize, setFontSize] = useState("16")

  return (
    <>
      <main className="toolbar">
        <div className="toolbar-editor">
          <div {...api.getRootProps()}>
            <FontPicker api={api} onChange={setFont} />

            <div {...api.getSeparatorProps()} />

            <FontSizeInput api={api} onChange={setFontSize} />

            <div {...api.getSeparatorProps()} />

            <FormatToggles api={api} onChange={setFormat} />

            <div {...api.getSeparatorProps()} />

            <AlignmentToggles api={api} onChange={setAlign} />
          </div>

          <div
            className="toolbar-editor-preview"
            style={{
              fontWeight: format.includes("bold") ? "bold" : "normal",
              fontStyle: format.includes("italic") ? "italic" : "normal",
              textDecoration: format.includes("underline") ? "underline" : "none",
              textAlign: align as "left" | "center" | "right",
              fontFamily: font,
              fontSize: `${fontSize}px`,
            }}
          >
            The quick brown fox jumps over the lazy dog.
          </div>
        </div>
      </main>

      <ControlsPanel>
        <StateVisualizer state={service} />
      </ControlsPanel>
    </>
  )
}
