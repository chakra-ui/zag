<script lang="ts">
  import * as field from "@zag-js/field"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/field.css"

  // Plain reactive form state: validates on submit, then re-validates on change
  function validate(value: string) {
    if (!value) return "Username is required"
    if (value.length < 3) return "Use at least 3 characters"
    return undefined
  }

  let submitted = $state<{ username: string } | null>(null)
  let value = $state("")
  let error = $state<string>()
  let touched = $state(false)
  let submitCount = $state(0)

  // the form owns validation and interaction flags; the field mirrors them
  const id = $props.id()
  const service = useMachine(field.machine, () => ({
    id,
    required: true,
    invalid: !!error,
    dirty: value !== "",
    touched,
  }))

  const api = $derived(field.connect(service, normalizeProps))

  const inputProps = $derived(
    mergeProps(api.getInputProps(), {
      name: "username",
      oninput(event: Event) {
        value = (event.currentTarget as HTMLInputElement).value
        if (submitCount > 0) error = validate(value)
      },
      onfocusout() {
        touched = true
      },
    }),
  )

  function onSubmit(event: SubmitEvent) {
    event.preventDefault()
    submitCount++
    error = validate(value)
    if (!error) submitted = { username: value }
  }
</script>

<main class="field-page">
  <h1>Field — Reactive Form</h1>
  <form novalidate onsubmit={onSubmit}>
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>
        Username <span {...api.getIndicatorProps({ type: "required" })}>*</span>
      </label>
      <input {...inputProps} placeholder="e.g. sage" />
      <span {...api.getHelperTextProps()}>Managed and validated by plain state.</span>
      <span {...api.getErrorTextProps()}>{error}</span>
    </div>
    {#if submitted}
      <span data-testid="submitted">Submitted: {submitted.username}</span>
    {/if}
    <div class="actions">
      <button type="submit">Submit</button>
    </div>
  </form>
</main>
