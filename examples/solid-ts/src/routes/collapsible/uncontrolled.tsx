import * as collapsible from "@zag-js/collapsible"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import "@styles/collapsible.css"

export default function Page() {
  const service = useMachine(collapsible.machine, {
    id: createUniqueId(),
    defaultOpen: true,
  })

  const api = createMemo(() => collapsible.connect(service, normalizeProps))

  return (
    <main class="collapsible">
      <h1>Collapsible Uncontrolled</h1>

      <div {...api().getRootProps()}>
        <button {...api().getTriggerProps()}>Toggle</button>
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
