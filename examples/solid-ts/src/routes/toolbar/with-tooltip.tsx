import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import * as toolbar from "@zag-js/toolbar"
import * as tooltip from "@zag-js/tooltip"
import { Show, createMemo, createUniqueId, type JSX } from "solid-js"
import { Portal } from "solid-js/web"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar as ControlsPanel } from "~/components/toolbar"
import "@styles/toolbar.css"
import "@styles/tooltip.css"

function IconButton(props: { api: () => toolbar.Api; value: string; label: string; children: JSX.Element }) {
  const id = createUniqueId()
  const service = useMachine(tooltip.machine, () => ({
    id,
    ids: { trigger: props.api().getItemId(props.value) },
    disabled: props.api().disabled,
  }))
  const tooltipApi = createMemo(() => tooltip.connect(service, normalizeProps))

  return (
    <>
      <button
        class="toolbar-icon-only"
        {...mergeProps(tooltipApi().getTriggerProps(), props.api().getItemProps({ value: props.value }))}
        aria-label={props.label}
      >
        {props.children}
      </button>
      <Show when={tooltipApi().open}>
        <Portal>
          <div {...tooltipApi().getPositionerProps()}>
            <div {...tooltipApi().getContentProps()}>{props.label}</div>
          </div>
        </Portal>
      </Show>
    </>
  )
}

export default function Page() {
  const service = useMachine(toolbar.machine, { id: createUniqueId() })
  const api = createMemo(() => toolbar.connect(service, normalizeProps))

  return (
    <>
      <main class="toolbar">
        <div {...api().getRootProps()}>
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
      </main>

      <ControlsPanel viz>
        <StateVisualizer state={service} />
      </ControlsPanel>
    </>
  )
}
