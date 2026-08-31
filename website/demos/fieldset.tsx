import * as field from "@zag-js/field"
import * as fieldset from "@zag-js/fieldset"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/react"
import { useId, type ComponentProps } from "react"
import styles from "../styles/machines/fieldset.module.css"

interface FieldsetProps extends Omit<fieldset.Props, "id"> {}

function DemoField({
  label,
  required,
  ...inputProps
}: {
  label: string
  required?: boolean
} & ComponentProps<"input">) {
  const service = useMachine(field.machine, {
    id: useId(),
    required,
  })
  const api = field.connect(service, normalizeProps)

  return (
    <div className={styles.Field} {...api.getRootProps()}>
      <label className={styles.Label} {...api.getLabelProps()}>
        {label}
        {required ? (
          <>
            {" "}
            <span
              className={styles.Required}
              {...api.getIndicatorProps({ type: "required" })}
            >
              *
            </span>
          </>
        ) : null}
      </label>
      <input
        {...mergeProps(
          { className: styles.Input },
          api.getInputProps(),
          inputProps,
        )}
      />
      <span className={styles.FieldError} {...api.getErrorTextProps()}>
        {api.errors[0]}
      </span>
    </div>
  )
}

export function Fieldset(props: FieldsetProps) {
  const fieldsetService = useMachine(fieldset.machine, {
    id: useId(),
    ...props,
  })
  const fieldsetApi = fieldset.connect(fieldsetService, normalizeProps)

  return (
    <form
      className={styles.Form}
      onSubmit={(event) => {
        event.preventDefault()
      }}
    >
      <fieldset className={styles.Root} {...fieldsetApi.getRootProps()}>
        <legend className={styles.Legend} {...fieldsetApi.getLegendProps()}>
          Contact details
        </legend>
        <span
          className={styles.HelperText}
          {...fieldsetApi.getHelperTextProps()}
        >
          How can we reach you?
        </span>

        <DemoField
          label="Name"
          name="name"
          required
          placeholder="Jane Doe"
          autoComplete="name"
        />
        <DemoField
          label="Email"
          name="email"
          type="email"
          required
          placeholder="jane@company.com"
          autoComplete="email"
        />
        <DemoField
          label="Phone"
          name="phone"
          type="tel"
          placeholder="+1 555 000 0000"
          autoComplete="tel"
        />

        <span className={styles.ErrorText} {...fieldsetApi.getErrorTextProps()}>
          Contact details are incomplete
        </span>

        <button className={styles.Submit} type="submit">
          Save contact
        </button>
      </fieldset>
    </form>
  )
}
