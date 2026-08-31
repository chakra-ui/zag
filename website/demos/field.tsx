import * as field from "@zag-js/field"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import styles from "../styles/machines/field.module.css"

interface FieldProps extends Omit<field.Props, "id"> {}

export function Field(props: FieldProps) {
  const service = useMachine(field.machine, {
    id: useId(),
    required: true,
    validationMode: "onBlur",
    validate({ value, validity }) {
      if (validity.typeMismatch) return "Enter a valid email"
      if (value.endsWith("@example.com")) return "Use a real email address"
    },
    ...props,
  })

  const api = field.connect(service, normalizeProps)

  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <label className={styles.Label} {...api.getLabelProps()}>
        Email{" "}
        <span
          className={styles.Required}
          {...api.getIndicatorProps({ type: "required" })}
        >
          *
        </span>
      </label>
      <input
        {...mergeProps(api.getInputProps(), {
          className: styles.Input,
          type: "email",
          placeholder: "you@company.com",
        })}
      />
      <span className={styles.HelperText} {...api.getHelperTextProps()}>
        We never share your email.
      </span>
      <span className={styles.ErrorText} {...api.getErrorTextProps()}>
        {api.errors[0]}
      </span>
    </div>
  )
}
