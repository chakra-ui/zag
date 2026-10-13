import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Show, createMemo, createSignal, createUniqueId, type JSX } from "solid-js"
import { Portal } from "solid-js/web"

// content stays mounted while closed and is re-mounted into a portal when open,
// so a doomed node exists at layer-effect time
function ConditionalPortal(props: { enabled: boolean; children: () => JSX.Element }) {
  return (
    <Show when={props.enabled} fallback={<div hidden>{props.children()}</div>}>
      <Portal>{props.children()}</Portal>
    </Show>
  )
}

export default function Page() {
  const [log, setLog] = createSignal<string[]>([])
  const service = useMachine(menu.machine, {
    id: createUniqueId(),
    onSelect: ({ value }) => setLog((p) => [...p, `select:${value}`]),
    onOpenChange: ({ open }) => setLog((p) => [...p, `open:${open}`]),
  })

  const api = createMemo(() => menu.connect(service, normalizeProps))

  return (
    <main>
      <div data-testid="open-state">{String(api().open)}</div>
      <div data-testid="log">{log().join(",")}</div>
      <button {...api().getTriggerProps()}>
        Actions <span {...api().getIndicatorProps()}>▾</span>
      </button>
      <ConditionalPortal enabled={api().open}>
        {() => (
          <div {...api().getPositionerProps()}>
            <ul {...api().getContentProps()}>
              <li {...api().getItemProps({ value: "edit" })}>Edit</li>
              <li {...api().getItemProps({ value: "duplicate" })}>Duplicate</li>
              <li {...api().getItemProps({ value: "delete" })}>Delete</li>
            </ul>
          </div>
        )}
      </ConditionalPortal>
    </main>
  )
}
