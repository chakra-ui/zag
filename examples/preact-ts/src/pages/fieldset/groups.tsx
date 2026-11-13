import { getEventTarget } from "@zag-js/dom-query"
import * as field from "@zag-js/field"
import * as fieldset from "@zag-js/fieldset"
import { normalizeProps, useMachine } from "@zag-js/preact"
import type { ComponentChildren } from "preact"
import { useId, useState } from "preact/hooks"
import "@styles/field.css"

interface OptionProps {
  type: "checkbox" | "radio"
  name: string
  value: string
  label: string
}

function Option(props: OptionProps) {
  const service = useMachine(field.machine, { id: useId() })
  const api = field.connect(service, normalizeProps)
  const inputProps = { ...api.getInputProps(), name: props.name, value: props.value }
  return (
    <div {...api.getRootProps()} className="field-option">
      {props.type === "radio" ? <input {...inputProps} type="radio" /> : <input {...inputProps} type="checkbox" />}
      <label {...api.getLabelProps()}>{props.label}</label>
    </div>
  )
}

function Group(props: { legend: string; error: string; invalid: boolean; children: ComponentChildren }) {
  const service = useMachine(fieldset.machine, { id: useId(), invalid: props.invalid })
  const api = fieldset.connect(service, normalizeProps)
  return (
    <fieldset {...api.getRootProps()}>
      <legend {...api.getLegendProps()}>{props.legend}</legend>
      {props.children}
      <span {...api.getErrorTextProps()}>{props.error}</span>
    </fieldset>
  )
}

export default function Page() {
  const [errors, setErrors] = useState({ plan: false, notify: false })
  const [status, setStatus] = useState("")

  return (
    <main className="field-page">
      <form
        onChange={(event) => {
          const target = getEventTarget<HTMLInputElement>(event)
          if (target) setErrors((prev) => ({ ...prev, [target.name]: false }))
        }}
        onSubmit={(event) => {
          event.preventDefault()
          const form = event.currentTarget
          const data = new FormData(form)
          const next = { plan: !data.get("plan"), notify: data.getAll("notify").length === 0 }
          setErrors(next)
          const firstInvalid = next.plan ? "plan" : next.notify ? "notify" : null
          if (firstInvalid) form.querySelector<HTMLInputElement>(`input[name="${firstInvalid}"]`)?.focus()
          setStatus(firstInvalid ? "" : "Submitted!")
        }}
      >
        <Group legend="Plan" error="Choose a plan" invalid={errors.plan}>
          <Option type="radio" name="plan" value="free" label="Free" />
          <Option type="radio" name="plan" value="pro" label="Pro" />
          <Option type="radio" name="plan" value="team" label="Team" />
        </Group>

        <Group legend="Notify me by" error="Pick at least one channel" invalid={errors.notify}>
          <Option type="checkbox" name="notify" value="email" label="Email" />
          <Option type="checkbox" name="notify" value="sms" label="SMS" />
          <Option type="checkbox" name="notify" value="push" label="Push" />
        </Group>

        <div className="actions">
          <button type="submit">Save</button>
        </div>
        <output data-testid="status">{status}</output>
      </form>
    </main>
  )
}
