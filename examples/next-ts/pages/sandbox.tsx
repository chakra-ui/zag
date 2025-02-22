import { normalizeProps, useMachine } from "@zag-js/react"
import { highlightState } from "@zag-js/stringify-state"
import { connect, machine } from "@zag-js/tooltip"
import { useId } from "react"

const Button = ({ tooltip, children }) => {
  const id = useId()
  const service = useMachine(machine, {
    id,
    closeOnScroll: false,
  })
  const api = connect(service, normalizeProps)
  return (
    <>
      <pre dangerouslySetInnerHTML={{ __html: highlightState(service.event) }} />
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
