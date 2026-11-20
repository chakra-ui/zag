import * as presence from "@zag-js/presence"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createSignal, For, Show } from "solid-js"
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
  const [present, setPresent] = createSignal(true)

  const service = useMachine(presence.machine, () => ({
    present: present(),
    onExitComplete: () => props.onRemove(props.item.id),
  }))
  const api = createMemo(() => presence.connect(service, normalizeProps))

  return (
    <Show when={api().present}>
      <li ref={(node) => api().setNode(node)} data-state={api().skip ? undefined : present() ? "open" : "closed"}>
        <span>
          <strong>{props.item.title}</strong>
          <br />
          <span class="meta">{props.item.meta}</span>
        </span>
        <button type="button" onClick={() => setPresent(false)}>
          Dismiss
        </button>
      </li>
    </Show>
  )
}

export default function Page() {
  const [items, setItems] = createSignal(initialItems)
  const dismissed = () => initialItems.length - items().length

  return (
    <main>
      <div class="presence-notifications">
        <p class="hint">Dismiss a notification. It leaves the list once its exit animation ends.</p>
        <ul data-testid="notifications">
          <For each={items()}>
            {(item) => (
              <Notification
                item={item}
                onRemove={(id) => setItems((prev) => prev.filter((other) => other.id !== id))}
              />
            )}
          </For>
        </ul>
        <p class="hint" data-testid="dismissed-count">
          {dismissed()} dismissed
        </p>
      </div>
    </main>
  )
}
