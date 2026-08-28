<script lang="ts">
  import { autoresizeTextarea } from "@zag-js/auto-resize"
  import * as field from "@zag-js/field"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import "@styles/field.css"

  let textareaRef = $state<HTMLTextAreaElement | null>(null)

  $effect(() => {
    return autoresizeTextarea(textareaRef)
  })

  const id = $props.id()
  const service = useMachine(field.machine, () => ({
    id,
    validationMode: "onChange" as const,
    validate({ value }: field.ValidateDetails) {
      if (value.length > 100) return "Keep it under 100 characters"
      return null
    },
  }))

  const api = $derived(field.connect(service, normalizeProps))
</script>

<main class="field-page">
  <h1>Field — Textarea autoresize</h1>
  <form onsubmit={(e) => e.preventDefault()}>
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>Bio</label>
      <textarea {...api.getTextareaProps()} bind:this={textareaRef} rows="2" placeholder="Tell us about yourself…"
      ></textarea>
      <span {...api.getHelperTextProps()}>The textarea grows with its content.</span>
      <span {...api.getErrorTextProps()}>{api.errors[0]}</span>
    </div>
  </form>
</main>

<Toolbar viz>
  <StateVisualizer state={service} />
</Toolbar>
