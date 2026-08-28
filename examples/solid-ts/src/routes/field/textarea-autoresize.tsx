import { autoresizeTextarea } from "@zag-js/auto-resize"
import * as field from "@zag-js/field"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId, onCleanup, onMount } from "solid-js"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/field.css"

export default function Page() {
  let textareaRef: HTMLTextAreaElement | undefined

  const service = useMachine(field.machine, () => ({
    id: createUniqueId(),
    validationMode: "onChange" as const,
    validate({ value }: field.ValidateDetails) {
      if (value.length > 100) return "Keep it under 100 characters"
      return null
    },
  }))

  const api = createMemo(() => field.connect(service, normalizeProps))

  onMount(() => {
    const cleanup = autoresizeTextarea(textareaRef ?? null)
    onCleanup(() => cleanup?.())
  })

  return (
    <>
      <main class="field-page">
        <h1>Field — Textarea autoresize</h1>
        <form onSubmit={(e) => e.preventDefault()}>
          <div {...api().getRootProps()}>
            <label {...api().getLabelProps()}>Bio</label>
            <textarea {...api().getTextareaProps()} ref={textareaRef} rows={2} placeholder="Tell us about yourself…" />
            <span {...api().getHelperTextProps()}>The textarea grows with its content.</span>
            <span {...api().getErrorTextProps()}>{api().errors[0]}</span>
          </div>
        </form>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
