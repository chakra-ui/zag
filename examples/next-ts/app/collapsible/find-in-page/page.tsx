"use client"

import * as collapsible from "@zag-js/collapsible"
import { normalizeProps, useMachine } from "@zag-js/react"
import { ChevronDownIcon } from "lucide-react"
import { useId } from "react"
import "@styles/collapsible.css"

export default function Page() {
  const service = useMachine(collapsible.machine, {
    id: useId(),
    hiddenUntilFound: true,
  })

  const api = collapsible.connect(service, normalizeProps)

  return (
    <main className="collapsible">
      <p>Search the page for “keyboard” to open the changelog.</p>
      <div {...api.getRootProps()}>
        <button {...api.getTriggerProps()}>
          Full changelog
          <div {...api.getIndicatorProps()}>
            <ChevronDownIcon />
          </div>
        </button>
        <div {...api.getContentProps()}>
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
