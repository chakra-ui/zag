import * as field from "@zag-js/field"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId, For } from "solid-js"
import { z } from "zod"
import "@styles/field.css"

const passwordSchema = z
  .string()
  .min(8, "At least 8 characters")
  .regex(/[A-Z]/, "One uppercase letter")
  .regex(/[0-9]/, "One number")

export default function Page() {
  const service = useMachine(field.machine, {
    id: createUniqueId(),
    required: true,
    validationMode: "onChange",
    validate: ({ value }) => passwordSchema.safeParse(value).error?.issues.map((issue) => issue.message),
  })

  const api = createMemo(() => field.connect(service, normalizeProps))

  return (
    <main class="field-page">
      <form onSubmit={(e) => e.preventDefault()}>
        <div {...api().getRootProps()}>
          <label {...api().getLabelProps()}>Password</label>
          <input {...api().getInputProps()} name="password" type="password" />
          <div {...api().getErrorTextProps()}>
            <ul>
              <For each={api().errors}>{(error) => <li>{error}</li>}</For>
            </ul>
          </div>
          <span {...api().getIndicatorProps({ type: "valid" })}>Strong password</span>
        </div>
        <div class="actions">
          <button type="submit">Save</button>
        </div>
      </form>
    </main>
  )
}
