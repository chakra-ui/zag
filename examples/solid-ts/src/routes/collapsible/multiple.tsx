import * as collapsible from "@zag-js/collapsible"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createSignal, createUniqueId, For } from "solid-js"
import "@styles/collapsible.css"

function Collapse(props: { value: number; open: boolean }) {
  let renders = 0
  const id = createUniqueId()

  const service = useMachine(collapsible.machine, () => ({
    id,
    open: props.open,
  }))

  const api = createMemo(() => collapsible.connect(service, normalizeProps))

  // Counts reactive updates of `open` (Solid components run once)
  const count = createMemo(() => {
    props.open
    return ++renders
  })

  return (
    <div {...api().getRootProps()}>
      <div {...api().getContentProps()}>
        <div
          style={{
            display: "flex",
            "justify-content": "center",
            "align-items": "center",
            "min-width": "400px",
            height: "64px",
            "background-color": "lightgray",
          }}
        >
          {props.value} {count()}
        </div>
      </div>
      <div>{service.context.get("initial").toString()}</div>
    </div>
  )
}

export default function Page() {
  const [list, setList] = createSignal([1, 2, 3])
  const [open, setOpen] = createSignal(true)
  return (
    <main>
      <div style={{ display: "flex", gap: "10px" }}>
        <For each={list()}>{(value) => <Collapse value={value} open={open()} />}</For>
      </div>
      <pre>
        list:{list().toString()}; open: {open().toString()}
      </pre>

      <div>
        <button onClick={() => setList([...list()].reverse())}>reverse</button>
        <button onClick={() => setOpen(!open())}>toggle collapse</button>
      </div>
    </main>
  )
}
