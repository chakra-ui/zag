import * as presence from "@zag-js/presence"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useCallback, useState } from "react"

function usePresence(present: boolean) {
  const context: presence.Context = { present }
  const [state, send] = useMachine(presence.machine(context), {
    context,
  })
  return presence.connect(state, send, normalizeProps)
}

export default function Page() {
  const [present, setPresent] = useState(false)
  const api = usePresence(present)

  const setNode = useCallback((node: HTMLElement | null) => {
    api.setNode(node)
  }, [])

  return (
    <main className="presence">
      <button onClick={() => setPresent((c) => !c)}>Toggle</button>
      {api.present && (
        <div ref={setNode} data-scope="presence" data-state={present ? "open" : "closed"}>
          Content
        </div>
      )}
    </main>
  )
}
