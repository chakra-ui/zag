import * as field from "@zag-js/field"
import * as fieldset from "@zag-js/fieldset"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import styles from "../../styles/machines/fieldset.module.css"
import { Ghost, Stack } from "./shared"

function useFieldset(props: Partial<fieldset.Props> = {}) {
  const service = useMachine(fieldset.machine, { id: useId(), ...props })
  return fieldset.connect(service, normalizeProps)
}

function TextField(
  props: { label: string; required?: boolean } & React.ComponentProps<"input">,
) {
  const { label, required, ...rest } = props
  const service = useMachine(field.machine, { id: useId(), required })
  const api = field.connect(service, normalizeProps)
  return (
    <div className={styles.Field} {...api.getRootProps()}>
      <label className={styles.Label} {...api.getLabelProps()}>
        {label}
        {required && (
          <>
            {" "}
            <span
              className={styles.Required}
              {...api.getIndicatorProps({ type: "required" })}
            >
              *
            </span>
          </>
        )}
      </label>
      <input
        {...mergeProps(api.getInputProps(), { className: styles.Input }, rest)}
      />
      <span className={styles.FieldError} {...api.getErrorTextProps()}>
        {api.errors[0]}
      </span>
    </div>
  )
}

export function FieldsetDisabled() {
  const [disabled, setDisabled] = useState(true)
  const api = useFieldset({ disabled })
  return (
    <Stack>
      <fieldset className={styles.Root} {...api.getRootProps()}>
        <legend className={styles.Legend} {...api.getLegendProps()}>
          Shipping
        </legend>
        <TextField label="Street" name="street" placeholder="12 Main St" />
        <TextField label="City" name="city" placeholder="Lagos" />
      </fieldset>
      <Ghost onClick={() => setDisabled((d) => !d)}>
        {disabled ? "Enable" : "Disable"} the group
      </Ghost>
    </Stack>
  )
}

const channels = ["Email", "SMS", "Push"]

export function FieldsetInvalid() {
  const [selected, setSelected] = useState<string[]>([])
  const api = useFieldset({ invalid: selected.length === 0 })
  return (
    <fieldset className={styles.Root} {...api.getRootProps()}>
      <legend className={styles.Legend} {...api.getLegendProps()}>
        Notifications
      </legend>
      {channels.map((channel) => (
        <label key={channel} className={styles.Option}>
          <input
            type="checkbox"
            name="channels"
            value={channel}
            checked={selected.includes(channel)}
            onChange={(event) => {
              const { checked } = event.currentTarget
              setSelected((prev) =>
                checked
                  ? [...prev, channel]
                  : prev.filter((c) => c !== channel),
              )
            }}
          />
          {channel}
        </label>
      ))}
      <span className={styles.ErrorText} {...api.getErrorTextProps()}>
        Select at least one channel
      </span>
    </fieldset>
  )
}

export function FieldsetHelperText() {
  const api = useFieldset()
  return (
    <fieldset className={styles.Root} {...api.getRootProps()}>
      <legend className={styles.Legend} {...api.getLegendProps()}>
        Contact details
      </legend>
      <span className={styles.HelperText} {...api.getHelperTextProps()}>
        How can we reach you?
      </span>
      <TextField label="Email" type="email" placeholder="jane@company.com" />
    </fieldset>
  )
}

export function FieldsetNested() {
  const [disabled, setDisabled] = useState(false)
  const api = useFieldset({ disabled })
  return (
    <Stack>
      <form
        className={styles.Form}
        onSubmit={(event) => event.preventDefault()}
      >
        <fieldset className={styles.Root} {...api.getRootProps()}>
          <legend className={styles.Legend} {...api.getLegendProps()}>
            Contact details
          </legend>
          <span className={styles.HelperText} {...api.getHelperTextProps()}>
            How can we reach you?
          </span>
          <TextField
            label="Phone"
            type="tel"
            name="phone"
            required
            placeholder="+1 555 000 0000"
          />
          <span className={styles.ErrorText} {...api.getErrorTextProps()}>
            Contact details are incomplete
          </span>
          <button className={styles.Submit} type="submit">
            Save contact
          </button>
        </fieldset>
      </form>
      <Ghost onClick={() => setDisabled((d) => !d)}>
        {disabled ? "Enable" : "Disable"} the fieldset
      </Ghost>
    </Stack>
  )
}

export function FieldsetRadios() {
  const [value, setValue] = useState("")
  const api = useFieldset({ invalid: value === "" })
  return (
    <fieldset className={styles.Root} {...api.getRootProps()}>
      <legend className={styles.Legend} {...api.getLegendProps()}>
        Backup schedule
      </legend>
      <span className={styles.HelperText} {...api.getHelperTextProps()}>
        Choose how often we save a copy
      </span>
      {["daily", "monthly"].map((option) => (
        <label key={option} className={styles.Option}>
          <input
            type="radio"
            name="backup"
            value={option}
            checked={value === option}
            onChange={() => setValue(option)}
          />
          {option === "daily" ? "Daily" : "Monthly"}
        </label>
      ))}
      <span className={styles.ErrorText} {...api.getErrorTextProps()}>
        Pick a schedule
      </span>
    </fieldset>
  )
}
