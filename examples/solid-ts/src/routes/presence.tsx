import * as presence from "@zag-js/presence"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Accessor, Show, createMemo, createSignal } from "solid-js"

function usePresence(present: Accessor<boolean>) {
  const context = createMemo(() => ({ present: present() }))
  const service = useMachine(presence.machine, context)
  return createMemo(() => presence.connect(service, normalizeProps))
}

export default function Page() {
  const [present, setPresent] = createSignal(false)
  const api = usePresence(present)
  return (
    <main class="presence">
      <button onClick={() => setPresent((c) => !c)}>Toggle</button>
      <Show when={api().present}>
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
