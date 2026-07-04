import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import * as checkbox from "@zag-js/checkbox"
import * as toolbar from "@zag-js/toolbar"
import { createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar as ControlsPanel } from "~/components/toolbar"
import "@styles/toolbar.css"

function TrackChangesToggle(props: { api: () => toolbar.Api }) {
  const id = createUniqueId()
  const service = useMachine(checkbox.machine, () => ({
    id,
    ids: { hiddenInput: props.api().getItemId("track-changes") },
    disabled: props.api().disabled,
  }))
  const checkboxApi = createMemo(() => checkbox.connect(service, normalizeProps))

  return (
    <label {...checkboxApi().getRootProps()} class="toolbar-item">
      <div {...checkboxApi().getControlProps()} />
      <input
        {...mergeProps(checkboxApi().getHiddenInputProps(), props.api().getItemProps({ value: "track-changes" }))}
        type="checkbox"
      />
      <span {...checkboxApi().getLabelProps()}>Track changes</span>
    </label>
  )
}

export default function Page() {
  const service = useMachine(toolbar.machine, { id: createUniqueId() })
  const api = createMemo(() => toolbar.connect(service, normalizeProps))

  return (
    <>
      <main class="toolbar">
        <div {...api().getRootProps()}>
          <button {...api().getItemProps({ value: "cut" })}>Cut</button>
          <button {...api().getItemProps({ value: "copy" })}>Copy</button>
          <div {...api().getSeparatorProps()} />
          <TrackChangesToggle api={api} />
        </div>
      </main>

      <ControlsPanel viz>
        <StateVisualizer state={service} />
      </ControlsPanel>
    </>
  )
}
