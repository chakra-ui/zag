import * as menu from "@zag-js/menu"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { useId, useState, type ReactNode } from "react"

// the consumer pattern from issue #3323: content stays mounted while closed and is
// re-parented into a portal when open, so a doomed node exists at layer-effect time
const ConditionalPortal = ({ enabled, children }: { enabled: boolean; children: ReactNode }) =>
  enabled ? <Portal>{children}</Portal> : <div hidden>{children}</div>

export default function Page() {
  const [log, setLog] = useState<string[]>([])
  const service = useMachine(menu.machine, {
    id: useId(),
    onSelect: ({ value }) => setLog((p) => [...p, `select:${value}`]),
    onOpenChange: ({ open }) => setLog((p) => [...p, `open:${open}`]),
  })

  const api = menu.connect(service, normalizeProps)

  return (
    <main>
      <div data-testid="open-state">{String(api.open)}</div>
      <div data-testid="log">{log.join(",")}</div>
      <button {...api.getTriggerProps()}>
        Actions <span {...api.getIndicatorProps()}>▾</span>
      </button>
      <ConditionalPortal enabled={api.open}>
        <div {...api.getPositionerProps()}>
          <ul {...api.getContentProps()}>
            <li {...api.getItemProps({ value: "edit" })}>Edit</li>
            <li {...api.getItemProps({ value: "duplicate" })}>Duplicate</li>
            <li {...api.getItemProps({ value: "delete" })}>Delete</li>
          </ul>
        </div>
      </ConditionalPortal>
    </main>
  )
}
