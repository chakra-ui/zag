import * as presence from "@zag-js/presence"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useState } from "react"

export default function Page() {
  const [present, setPresent] = useState(false)
  const service = useMachine(presence.machine, { present })
  const api = presence.connect(service, normalizeProps)

  return (
    <main className="presence">
      <button onClick={() => setPresent((c) => !c)}>Toggle</button>
      {api.present && (
        <div
          ref={(node) => {
            api.setNode(node)
          }}
          data-scope="presence"
          data-state={api.skip ? undefined : present ? "open" : "closed"}
        >
          Content
        </div>
      )}
    </main>
  )
}
