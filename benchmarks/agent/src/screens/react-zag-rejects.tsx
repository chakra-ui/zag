// Not a benchmark screen: controlled components whose parent refuses or changes what it's asked,
// for checking that `@zag-js/agent` reports what the page kept. Open it with ?screen=react-zag-rejects&agent.
import * as checkbox from "@zag-js/checkbox"
import { normalizeProps, useMachine } from "@zag-js/react"
import * as zagSwitch from "@zag-js/switch"
import * as React from "react"
import { createRoot } from "react-dom/client"

type Checked = boolean | "indeterminate"

function ControlledSwitch(props: { label: string; checked: boolean; onRequest: (checked: boolean) => void }) {
  const service = useMachine(zagSwitch.machine, {
    id: React.useId(),
    checked: props.checked,
    onCheckedChange: (details) => props.onRequest(details.checked),
  })
  const api = zagSwitch.connect(service, normalizeProps)
  return (
    <label {...api.getRootProps()} className="choice">
      <input {...api.getHiddenInputProps()} />
      <span {...api.getControlProps()} className="switch">
        <span {...api.getThumbProps()} className="switch-thumb" />
      </span>
      <span {...api.getLabelProps()}>{props.label}</span>
    </label>
  )
}

function ControlledCheckbox(props: { label: string; checked: Checked; onRequest: (checked: Checked) => void }) {
  const service = useMachine(checkbox.machine, {
    id: React.useId(),
    checked: props.checked,
    onCheckedChange: (details) => props.onRequest(details.checked),
  })
  const api = checkbox.connect(service, normalizeProps)
  return (
    <label {...api.getRootProps()} className="choice">
      <input {...api.getHiddenInputProps()} />
      <span {...api.getControlProps()} className="switch" />
      <span {...api.getLabelProps()}>{props.label}</span>
    </label>
  )
}

function Screen() {
  // Refuses every change: `checked` never moves.
  const alwaysOff = false
  // Takes true and refuses false.
  const [onlyOn, setOnlyOn] = React.useState(false)
  // Answers any change with "indeterminate".
  const [coerced, setCoerced] = React.useState<Checked>(false)

  return (
    <main className="screen">
      <h1>Refused changes</h1>
      <ControlledSwitch label="Always off" checked={alwaysOff} onRequest={() => {}} />
      <ControlledSwitch label="Only on" checked={onlyOn} onRequest={(next) => next && setOnlyOn(true)} />
      <ControlledCheckbox label="Coerced" checked={coerced} onRequest={() => setCoerced("indeterminate")} />
    </main>
  )
}

function mount(root: HTMLElement) {
  createRoot(root).render(<Screen />)
}

export { mount }
