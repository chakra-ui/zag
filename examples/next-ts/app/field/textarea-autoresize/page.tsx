"use client"

import { autoresizeTextarea } from "@zag-js/auto-resize"
import * as field from "@zag-js/field"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useEffect, useId, useRef } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import "@styles/field.css"

export default function Page() {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const service = useMachine(field.machine, {
    id: useId(),
    validationMode: "onChange",
    validate({ value }) {
      if (value.length > 100) return "Keep it under 100 characters"
      return null
    },
  })

  const api = field.connect(service, normalizeProps)

  useEffect(() => autoresizeTextarea(textareaRef.current), [])

  return (
    <>
      <main className="field-page">
        <h1>Field — Textarea autoresize</h1>
        <form onSubmit={(e) => e.preventDefault()}>
          <div {...api.getRootProps()}>
            <label {...api.getLabelProps()}>Bio</label>
            <textarea {...api.getTextareaProps()} ref={textareaRef} rows={2} placeholder="Tell us about yourself…" />
            <span {...api.getHelperTextProps()}>The textarea grows with its content.</span>
            <span {...api.getErrorTextProps()}>{api.errors[0]}</span>
          </div>
        </form>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
