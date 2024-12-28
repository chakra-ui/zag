import * as collapsible from "@zag-js/collapsible"
import { normalizeProps, useMachine } from "@zag-js/react"
import { memo, useId, useRef, useState } from "react"

const Collapse = memo((props: { value: number; open: boolean }) => {
  const { open, value } = props
  const ref = useRef(0)

  const [state, send] = useMachine(
    collapsible.machine({
      id: useId(),
      open,
    }),
    { context: { open } },
  )

  const api = collapsible.connect(state, send, normalizeProps)

  ref.current++

  return (
    <div {...api.getRootProps()}>
      <div {...api.getContentProps()}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minWidth: "400px",
            height: "64px",
            backgroundColor: "lightgray",
          }}
        >
          {value} {ref.current}
        </div>
      </div>
      <div>{state.context.initial.toString()}</div>
    </div>
  )
})

const CollapseMultiple = () => {
  const [list, setList] = useState([1, 2, 3])
  const [open, setOpen] = useState(true)
  return (
    <main>
      <div style={{ display: "flex", gap: "10px" }}>
        {list.map((value) => (
          <Collapse key={value} value={value} open={open} />
        ))}
      </div>
      <pre>
        list:{list.toString()}; open: {open.toString()}
      </pre>

      <div>
        <button
          onClick={() => {
            setList([...list].reverse())
          }}
        >
          reverse
        </button>
        <button onClick={() => setOpen(!open)}>toggle collapse</button>
      </div>
    </main>
  )
}

export default CollapseMultiple
