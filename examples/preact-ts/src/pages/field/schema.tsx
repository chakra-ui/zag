import * as field from "@zag-js/field"
import { normalizeProps, useMachine } from "@zag-js/preact"
import { useId } from "preact/hooks"
import { z } from "zod"
import "@styles/field.css"

const passwordSchema = z
  .string()
  .min(8, "At least 8 characters")
  .regex(/[A-Z]/, "One uppercase letter")
  .regex(/[0-9]/, "One number")

export default function Page() {
  const service = useMachine(field.machine, {
    id: useId(),
    required: true,
    validationMode: "onChange",
    validate: ({ value }) => passwordSchema.safeParse(value).error?.issues.map((issue) => issue.message),
  })

  const api = field.connect(service, normalizeProps)

  return (
    <main className="field-page">
      <form onSubmit={(e) => e.preventDefault()}>
        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()}>Password</label>
          <input {...api.getInputProps()} name="password" type="password" />
          <div {...api.getErrorTextProps()}>
            <ul>
              {api.errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
          <span {...api.getIndicatorProps({ type: "valid" })}>Strong password</span>
        </div>
        <div className="actions">
          <button type="submit">Save</button>
        </div>
      </form>
    </main>
  )
}
