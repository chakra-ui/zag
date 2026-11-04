import * as editable from "@zag-js/editable"
import { normalizeProps, useMachine } from "@zag-js/preact"
import { useId, useState } from "preact/hooks"
import "@styles/editable.css"

interface FieldProps {
  name: string
  format: (value: string) => string
}

function Field(props: FieldProps) {
  const [value, setValue] = useState("abc")

  const service = useMachine(editable.machine, {
    id: useId(),
    value,
    onValueChange(details) {
      setValue(props.format(details.value))
    },
  })

  const api = editable.connect(service, normalizeProps)

  return (
    <div data-testid={props.name} {...api.getRootProps()}>
      <label {...api.getLabelProps()}>{props.name}</label>
      <div {...api.getAreaProps()}>
        <input data-testid="input" {...api.getInputProps()} />
        <span data-testid="preview" {...api.getPreviewProps()} />
      </div>
      <output data-testid="value">{value}</output>
    </div>
  )
}

export default function Page() {
  return (
    <main className="editable">
      <Field name="no-digits" format={(value) => value.replace(/\d/g, "")} />
      <Field name="uppercase" format={(value) => value.toUpperCase()} />
    </main>
  )
}
