"use client"

import * as presence from "@zag-js/presence"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useState } from "react"
import "@styles/presence.css"

interface Item {
  id: string
  title: string
  meta: string
}

const initialItems: Item[] = [
  { id: "payment", title: "Payment received", meta: "$1,240 from Northwind" },
  { id: "invite", title: "Invite accepted", meta: "Ada joined the design team" },
  { id: "build", title: "Build finished", meta: "main deployed in 2m 14s" },
]

function Notification(props: { item: Item; onRemove: (id: string) => void }) {
  const { item, onRemove } = props
  const [present, setPresent] = useState(true)

  const service = useMachine(presence.machine, { present, onExitComplete: () => onRemove(item.id) })
  const api = presence.connect(service, normalizeProps)

  if (!api.present) return null

  return (
    <li ref={(node) => api.setNode(node)} data-state={api.skip ? undefined : present ? "open" : "closed"}>
      <span>
        <strong>{item.title}</strong>
        <br />
        <span className="meta">{item.meta}</span>
      </span>
      <button type="button" aria-label={`Dismiss ${item.title}`} onClick={() => setPresent(false)}>
        Dismiss
      </button>
    </li>
  )
}

export default function Page() {
  const [items, setItems] = useState(initialItems)
  const dismissed = initialItems.length - items.length

  return (
    <main>
      <div className="presence-notifications">
        <ul>
          {items.map((item) => (
            <Notification
              key={item.id}
              item={item}
              onRemove={(id) => setItems((prev) => prev.filter((other) => other.id !== id))}
            />
          ))}
        </ul>
        <p className="hint">{dismissed} dismissed</p>
      </div>
    </main>
  )
}
