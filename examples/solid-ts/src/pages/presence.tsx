import * as presence from "@zag-js/presence"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Accessor, Show, createEffect, createMemo, createSignal } from "solid-js"

function usePresence(present: Accessor<boolean>) {
  const [state, send, service] = useMachine(presence.machine({ present: present() }))
  createEffect(() => {
    service.setContext({ present: present() })
  })
  return createMemo(() => presence.connect(state, send, normalizeProps))
}

export default function Page() {
  const [present, setPresent] = createSignal(false)
  const api = usePresence(present)
  return (
    <main class="presence">
      <button onClick={() => setPresent((c) => !c)}>Toggle</button>
      <Show when={api().isPresent}>
        <div
          ref={(node) => {
            api().setNode(node)
          }}
          data-scope="presence"
          data-state={present() ? "open" : "closed"}
        >
          Content
        </div>
      </Show>
    </main>
  )
}
