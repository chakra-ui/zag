import * as radio from "@zag-js/radio-group"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"

type Settings = {
  value: string | null
  disabled: boolean
}

export default function Page() {
  const id = useId()
  const [settings, setSettings] = useState<Settings>({
    value: "viewer",
    disabled: false,
  })
  const [submission, setSubmission] = useState<string>("")

  const service = useMachine(radio.machine, {
    id,
    name: "role",
    value: settings.value,
    disabled: settings.disabled,
    onValueChange(details) {
      setSettings((current) => ({ ...current, value: details.value }))
    },
  })

  const api = radio.connect(service, normalizeProps)

  const roles = ["viewer", "editor"] as const

  return (
    <main className="radio">
      <p data-testid="controlled-value">Controlled value: {settings.value ?? "null"}</p>
      <p data-testid="controlled-disabled">Disabled: {String(settings.disabled)}</p>

      <form
        onSubmit={(event) => {
          event.preventDefault()
          const form = event.currentTarget
          const payload = {
            controlledValue: settings.value,
            submittedRole: new FormData(form).get("role"),
            inputs: Array.from(form.querySelectorAll<HTMLInputElement>('input[type="radio"]')).map((input) => ({
              value: input.value,
              checked: input.checked,
              defaultChecked: input.defaultChecked,
              disabled: input.disabled,
            })),
          }
          setSubmission(JSON.stringify(payload))
        }}
      >
        <div {...api.getRootProps()}>
          <h3 {...api.getLabelProps()}>Role</h3>
          {roles.map((value) => {
            const item = { value }
            return (
              <label key={value} data-testid={`radio-${value}`} {...api.getItemProps(item)}>
                <div data-testid={`control-${value}`} {...api.getItemControlProps(item)} />
                <span data-testid={`label-${value}`} {...api.getItemTextProps(item)}>
                  {value}
                </span>
                <input data-testid={`input-${value}`} {...api.getItemHiddenInputProps(item)} />
              </label>
            )
          })}
        </div>

        <button type="button" onClick={() => setSettings({ value: "editor", disabled: true })}>
          Set editor and disable
        </button>
        <button type="button" onClick={() => setSettings((current) => ({ ...current, disabled: false }))}>
          Enable only
        </button>
        <button type="submit">Submit</button>
      </form>

      <pre data-testid="last-submit">{submission}</pre>
    </main>
  )
}
