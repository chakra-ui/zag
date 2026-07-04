import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import * as numberInput from "@zag-js/number-input"
import * as select from "@zag-js/select"
import * as toggleGroup from "@zag-js/toggle-group"
import * as toolbar from "@zag-js/toolbar"
import { For, createMemo, createSignal, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar as ControlsPanel } from "~/components/toolbar"
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

function FontPicker(props: { api: () => toolbar.Api; onChange: (value: string) => void }) {
  const id = createUniqueId()
  const triggerId = createMemo(() => props.api().getItemId("font"))

  const service = useMachine(select.machine, () => ({
    id,
    ids: { trigger: triggerId() },
    collection: select.collection({ items: fonts }),
    disabled: props.api().disabled,
    defaultValue: ["sans-serif"],
    onValueChange(details) {
      props.onChange(details.value[0])
    },
  }))
  const fontApi = createMemo(() => select.connect(service, normalizeProps))

  return (
    <>
      <button {...mergeProps(fontApi().getTriggerProps(), props.api().getItemProps({ value: "font" }))}>
        <span>{fontApi().valueAsString}</span>
        <span aria-hidden>▾</span>
      </button>
      <Portal>
        <div {...fontApi().getPositionerProps()}>
          <div {...fontApi().getContentProps()}>
            <ul {...fontApi().getListProps()}>
              <For each={fonts}>
                {(item) => (
                  <li {...fontApi().getItemProps({ item })}>
                    <span {...fontApi().getItemTextProps({ item })}>{item.label}</span>
                  </li>
                )}
              </For>
            </ul>
          </div>
        </div>
      </Portal>
    </>
  )
}

function FontSizeInput(props: { api: () => toolbar.Api; onChange: (value: string) => void }) {
  const id = createUniqueId()
  const inputId = createMemo(() => props.api().getItemId("font-size"))

  const service = useMachine(numberInput.machine, () => ({
    id,
    ids: { input: inputId() },
    disabled: props.api().disabled,
    defaultValue: "16",
    min: 8,
    max: 96,
    onValueChange(details) {
      props.onChange(details.value)
    },
  }))
  const numberApi = createMemo(() => numberInput.connect(service, normalizeProps))

  return (
    <div {...numberApi().getControlProps()}>
      <button {...numberApi().getDecrementTriggerProps()} aria-label="Decrease font size">
        −
      </button>
      <input
        class="toolbar-number-input"
        {...mergeProps(numberApi().getInputProps(), props.api().getInputProps({ value: "font-size" }))}
      />
      <button {...numberApi().getIncrementTriggerProps()} aria-label="Increase font size">
        +
      </button>
    </div>
  )
}

function FormatToggles(props: { api: () => toolbar.Api; onChange: (value: string[]) => void }) {
  const id = createUniqueId()
  const service = useMachine(toggleGroup.machine, () => ({
    id,
    disabled: props.api().disabled,
    orientation: props.api().orientation,
    multiple: true,
    defaultValue: [],
    onValueChange(details) {
      props.onChange(details.value)
    },
  }))
  const api = createMemo(() => toggleGroup.connect(service, normalizeProps))

  return (
    <div {...api().getRootProps()}>
      <button {...api().getItemProps({ value: "bold" })} aria-label="Bold">
        <strong>B</strong>
      </button>
      <button {...api().getItemProps({ value: "italic" })} aria-label="Italic">
        <em>I</em>
      </button>
      <button {...api().getItemProps({ value: "underline" })} aria-label="Underline">
        <u>U</u>
      </button>
    </div>
  )
}

function AlignmentToggles(props: { api: () => toolbar.Api; onChange: (value: string) => void }) {
  const id = createUniqueId()
  const service = useMachine(toggleGroup.machine, () => ({
    id,
    disabled: props.api().disabled,
    orientation: props.api().orientation,
    defaultValue: ["left"],
    onValueChange(details) {
      if (details.value[0]) props.onChange(details.value[0])
    },
  }))
  const api = createMemo(() => toggleGroup.connect(service, normalizeProps))

  return (
    <div {...api().getRootProps()}>
      <button {...api().getItemProps({ value: "left" })} aria-label="Align left">
        ⯇
      </button>
      <button {...api().getItemProps({ value: "center" })} aria-label="Align center">
        ≡
      </button>
      <button {...api().getItemProps({ value: "right" })} aria-label="Align right">
        ⯈
      </button>
    </div>
  )
}

export default function Page() {
  const service = useMachine(toolbar.machine, { id: createUniqueId() })
  const api = createMemo(() => toolbar.connect(service, normalizeProps))

  const [format, setFormat] = createSignal<string[]>([])
  const [align, setAlign] = createSignal("left")
  const [font, setFont] = createSignal("sans-serif")
  const [fontSize, setFontSize] = createSignal("16")

  return (
    <>
      <main class="toolbar">
        <div class="toolbar-editor">
          <div {...api().getRootProps()}>
            <FontPicker api={api} onChange={setFont} />

            <div {...api().getSeparatorProps()} />

            <FontSizeInput api={api} onChange={setFontSize} />

            <div {...api().getSeparatorProps()} />

            <FormatToggles api={api} onChange={setFormat} />

            <div {...api().getSeparatorProps()} />

            <AlignmentToggles api={api} onChange={setAlign} />
          </div>

          <div
            class="toolbar-editor-preview"
            style={{
              "font-weight": format().includes("bold") ? "bold" : "normal",
              "font-style": format().includes("italic") ? "italic" : "normal",
              "text-decoration": format().includes("underline") ? "underline" : "none",
              "text-align": align() as "left" | "center" | "right",
              "font-family": font(),
              "font-size": `${fontSize()}px`,
            }}
          >
            The quick brown fox jumps over the lazy dog.
          </div>
        </div>
      </main>

      <ControlsPanel viz>
        <StateVisualizer state={service} />
      </ControlsPanel>
    </>
  )
}
