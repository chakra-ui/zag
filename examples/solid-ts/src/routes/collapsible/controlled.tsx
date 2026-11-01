import * as collapsible from "@zag-js/collapsible"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createSignal, createUniqueId } from "solid-js"
import "@styles/collapsible.css"

export default function Page() {
  const [open, setOpen] = createSignal(true)

  const id = createUniqueId()
  const service = useMachine(collapsible.machine, () => ({
    id,
    open: open(),
    onOpenChange: (details) => setOpen(details.open),
  }))

  const api = createMemo(() => collapsible.connect(service, normalizeProps))

  return (
    <main class="collapsible">
      <h1>Collapsible Controlled</h1>
      <h1>{String(open())}</h1>

      <div style={{ display: "flex", gap: "12px" }}>
        <button type="button" onClick={() => setOpen(true)}>
          Open
        </button>
        <button type="button" onClick={() => setOpen(false)}>
          Close
        </button>
      </div>

      <div {...api().getRootProps()}>
        <div {...api().getContentProps()}>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
            ea commodo consequat. <a href="#">Some Link</a>
          </p>
        </div>
      </div>
    </main>
  )
}
