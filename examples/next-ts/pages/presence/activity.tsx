import * as collapsible from "@zag-js/collapsible"
import * as presence from "@zag-js/presence"
import { normalizeProps, useMachine } from "@zag-js/react"
import { Activity, useId, useState } from "react"

function Demo(props: { label: string; open: boolean }) {
  const { label, open } = props

  const presenceService = useMachine(presence.machine, { present: open })
  const presenceApi = presence.connect(presenceService, normalizeProps)

  const collapsibleService = useMachine(collapsible.machine, { id: useId(), open })
  const collapsibleApi = collapsible.connect(collapsibleService, normalizeProps)

  return (
    <section style={{ border: "1px solid #ccc", padding: 12, marginTop: 12 }}>
      <h3>{label}</h3>
      <p>
        prop: {String(open)} · presence: {String(presenceApi.present)} · collapsible: {String(collapsibleApi.open)}
      </p>
      {presenceApi.present && (
        <div ref={(node) => presenceApi.setNode(node)} data-scope="presence" data-part="content">
          Presence content
        </div>
      )}
      <div {...collapsibleApi.getRootProps()}>
        <div {...collapsibleApi.getContentProps()}>Collapsible content</div>
      </div>
    </section>
  )
}

export default function Page() {
  const [open, setOpen] = useState(false)
  const [visible, setVisible] = useState(false)

  return (
    <main className="presence">
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => setOpen((v) => !v)}>Toggle open</button>
        <button onClick={() => setVisible((v) => !v)}>Toggle Activity ({visible ? "visible" : "hidden"})</button>
      </div>

      <Demo label="Control" open={open} />

      <Activity mode={visible ? "visible" : "hidden"}>
        <Demo label="Inside Activity" open={open} />
      </Activity>
    </main>
  )
}
