"use client"

import * as field from "@zag-js/field"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import { useForm } from "react-hook-form"
import "@styles/field.css"

interface FormValues {
  username: string
}

export default function Page() {
  const [submitted, setSubmitted] = useState<FormValues | null>(null)

  const {
    register,
    formState: { errors, dirtyFields, touchedFields },
    handleSubmit,
  } = useForm<FormValues>()

  // the library owns validation and interaction flags; the field mirrors them
  const service = useMachine(field.machine, {
    id: useId(),
    required: true,
    invalid: !!errors.username,
    dirty: !!dirtyFields.username,
    touched: !!touchedFields.username,
  })

  const api = field.connect(service, normalizeProps)

  return (
    <main className="field-page">
      <h1>Field — React Hook Form</h1>
      <form onSubmit={handleSubmit(setSubmitted)} noValidate>
        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()}>
            Username <span {...api.getIndicatorProps({ type: "required" })}>*</span>
          </label>
          <input
            {...mergeProps(
              api.getInputProps(),
              register("username", {
                required: "Username is required",
                minLength: { value: 3, message: "Use at least 3 characters" },
              }),
            )}
            placeholder="e.g. sage"
          />
          <span {...api.getHelperTextProps()}>Managed and validated by React Hook Form.</span>
          <span {...api.getErrorTextProps()}>{errors.username?.message}</span>
        </div>
        {submitted && <span data-testid="submitted">Submitted: {submitted.username}</span>}
        <div className="actions">
          <button type="submit">Submit</button>
        </div>
      </form>
    </main>
  )
}
