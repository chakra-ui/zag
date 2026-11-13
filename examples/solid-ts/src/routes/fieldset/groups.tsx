import { getEventTarget } from "@zag-js/dom-query"
import * as field from "@zag-js/field"
import * as fieldset from "@zag-js/fieldset"
import { normalizeProps, useMachine } from "@zag-js/solid"
import type { JSX } from "@solidjs/web"
import { createMemo, createSignal, createUniqueId } from "solid-js"
import "@styles/field.css"

interface OptionProps {
  type: "checkbox" | "radio"
  name: string
  value: string
  label: string
}

function Option(props: OptionProps) {
  const service = useMachine(field.machine, { id: createUniqueId() })
  const api = createMemo(() => field.connect(service, normalizeProps))
  return (
    <div {...api().getRootProps()} class="field-option">
      <input {...api().getInputProps()} type={props.type} name={props.name} value={props.value} />
      <label {...api().getLabelProps()}>{props.label}</label>
    </div>
  )
}

function Group(props: { legend: string; error: string; invalid: boolean; children: JSX.Element }) {
  const id = createUniqueId()
  const service = useMachine(fieldset.machine, () => ({ id, invalid: props.invalid }))
  const api = createMemo(() => fieldset.connect(service, normalizeProps))
  return (
    <fieldset {...api().getRootProps()}>
      <legend {...api().getLegendProps()}>{props.legend}</legend>
      {props.children}
      <span {...api().getErrorTextProps()}>{props.error}</span>
    </fieldset>
  )
}

export default function Page() {
  const [errors, setErrors] = createSignal({ plan: false, notify: false })
  const [status, setStatus] = createSignal("")

  return (
    <main class="field-page">
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
        <Group legend="Plan" error="Choose a plan" invalid={errors().plan}>
          <Option type="radio" name="plan" value="free" label="Free" />
          <Option type="radio" name="plan" value="pro" label="Pro" />
          <Option type="radio" name="plan" value="team" label="Team" />
        </Group>

        <Group legend="Notify me by" error="Pick at least one channel" invalid={errors().notify}>
          <Option type="checkbox" name="notify" value="email" label="Email" />
          <Option type="checkbox" name="notify" value="sms" label="SMS" />
          <Option type="checkbox" name="notify" value="push" label="Push" />
        </Group>

        <div class="actions">
          <button type="submit">Save</button>
        </div>
        <output data-testid="status">{status()}</output>
      </form>
    </main>
  )
}
