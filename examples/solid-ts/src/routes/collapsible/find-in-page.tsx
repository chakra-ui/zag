import * as collapsible from "@zag-js/collapsible"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { ChevronDownIcon } from "lucide-solid"
import { createMemo, createUniqueId } from "solid-js"
import "@styles/collapsible.css"

export default function Page() {
  const service = useMachine(collapsible.machine, { id: createUniqueId(), hiddenUntilFound: true })
  const api = createMemo(() => collapsible.connect(service, normalizeProps))

  return (
    <main class="collapsible">
      <p>Search the page for “keyboard” to open the changelog.</p>
      <div {...api().getRootProps()}>
        <button {...api().getTriggerProps()}>
          Full changelog
          <div {...api().getIndicatorProps()}>
            <ChevronDownIcon />
          </div>
        </button>
        <div {...api().getContentProps()}>
          <ul>
            <li>Added keyboard support for reordering items.</li>
            <li>Fixed focus returning to the trigger after closing.</li>
            <li>Improved the open animation on slower devices.</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
