import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import { toolbarControls, toolbarData } from "@zag-js/shared"
import * as select from "@zag-js/select"
import * as toggleGroup from "@zag-js/toggle-group"
import * as toolbar from "@zag-js/toolbar"
import { For, createMemo, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar as ControlsPanel } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"
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

function AlignmentGroup(props: { api: () => toolbar.Api }) {
  const id = createUniqueId()
  const service = useMachine(toggleGroup.machine, () => ({
    id,
    disabled: props.api().disabled,
    orientation: props.api().orientation,
    defaultValue: ["left"],
  }))
  const api = createMemo(() => toggleGroup.connect(service, normalizeProps))

  return (
    <div {...api().getRootProps()}>
      <button {...api().getItemProps({ value: "left" })} aria-label="Align left">
        ⯇
      </button>
      <button {...api().getItemProps({ value: "right" })} aria-label="Align right">
        ⯈
      </button>
    </div>
  )
}

function ClipboardGroup(props: { api: () => toolbar.Api }) {
  return (
    <div {...props.api().getGroupProps({ value: "clipboard" })}>
      <For each={toolbarData}>
        {(item) => <button {...props.api().getItemProps({ value: item.id })}>{item.label}</button>}
      </For>
    </div>
  )
}

function FontPicker(props: { api: () => toolbar.Api }) {
  const id = createUniqueId()
  const triggerId = createMemo(() => props.api().getItemId("font"))

  const service = useMachine(select.machine, () => ({
    id,
    ids: { trigger: triggerId() },
    collection: select.collection({ items: fonts }),
    disabled: props.api().disabled,
    defaultValue: ["helvetica"],
  }))
  const fontApi = createMemo(() => select.connect(service, normalizeProps))

  return (
    <>
      <button {...mergeProps(fontApi().getTriggerProps(), props.api().getItemProps({ value: "font" }))}>
        <span>{fontApi().valueAsString || "Font"}</span>
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

export default function Page() {
  const controls = useControls(toolbarControls)

  const service = useMachine(
    toolbar.machine,
    controls.mergeProps<toolbar.Props>(() => ({
      id: createUniqueId(),
    })),
  )
  const api = createMemo(() => toolbar.connect(service, normalizeProps))

  return (
    <>
      <main class="toolbar">
        <div {...api().getRootProps()}>
          <AlignmentGroup api={api} />

          <div {...api().getSeparatorProps()} />

          <ClipboardGroup api={api} />

          <div {...api().getSeparatorProps()} />

          <FontPicker api={api} />

          <div {...api().getSeparatorProps()} />

          <a {...api().getLinkProps({ value: "edited" })} href="https://zagjs.com" target="_blank" rel="noreferrer">
            Edited 51m ago
          </a>
        </div>
      </main>

      <ControlsPanel controls={controls} viz>
        <StateVisualizer state={service} />
      </ControlsPanel>
    </>
  )
}
