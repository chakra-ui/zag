import * as presence from "@zag-js/presence"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useState } from "react"

function usePresence(present: boolean) {
  const context = { present }
  const [state, send] = useMachine(presence.machine(context), {
    context,
  })
  return presence.connect(state, send, normalizeProps)
}

export default function Page() {
  const [present, setPresent] = useState(false)
  const api = usePresence(present)

  return (
    <main className="presence">
      <button onClick={() => setPresent((c) => !c)}>Toggle</button>
      {api.isPresent && (
        <div
          ref={(node) => {
            api.setNode(node)
          }}
          data-scope="presence"
          data-state={present ? "open" : "closed"}
        >
          Content
        </div>
      )}
    </main>
  )
}
