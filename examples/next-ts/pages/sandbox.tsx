import { normalizeProps, useMachine } from "@zag-js/react"
import { stringifyState } from "@zag-js/shared"
import { connect, machine } from "@zag-js/tooltip"
import { useId } from "react"

const Button = ({ tooltip, children }) => {
  const id = useId()
  const [state, send] = useMachine(
    machine({
      id,
      closeOnScroll: false,
    }),
  )
  const api = connect(state, send, normalizeProps)
  return (
    <>
      <pre dangerouslySetInnerHTML={{ __html: stringifyState(state.event) }} />
      <button {...api.getTriggerProps()}>{children}</button>
      <div {...api.getPositionerProps()}>
        <div {...api.getContentProps()}>{tooltip}</div>
      </div>
    </>
  )
}

export default function Page() {
  return (
    <main>
      <div>
        <Button tooltip="Hello world">Works</Button>
      </div>
      <div style={{ height: "100vh" }} />
      <div>
        <Button tooltip="Hello world">Does not Work</Button>
      </div>
    </main>
  )
}
