<script lang="ts">
  import * as field from "@zag-js/field"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import "@styles/field.css"

  const TAKEN_EMAILS = ["taken@example.com"]

  const checkEmail = (value: string) => (TAKEN_EMAILS.includes(value) ? "This email is already taken" : null)

  let calls = $state(0)
  let timer: ReturnType<typeof setTimeout> | undefined

  const id = $props.id()
  const service = useMachine(field.machine, () => ({
    id,
    required: true,
    validationMode: "onChange",
    // Debounce by returning a promise and resetting the timer. The machine drops stale resolutions.
    validate({ value }: field.ValidateDetails) {
      return new Promise<field.ValidateResult>((resolve) => {
        clearTimeout(timer)
        timer = setTimeout(() => {
          calls += 1
          resolve(checkEmail(value))
        }, 400)
      })
    },
  }))

  const api = $derived(field.connect(service, normalizeProps))
</script>

<main class="field-page">
  <h1>Field — Debounced Validation</h1>
  <form onsubmit={(e) => e.preventDefault()}>
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>
        Email <span {...api.getIndicatorProps({ type: "required" })}>*</span>
      </label>
      <input {...api.getInputProps()} placeholder="taken@example.com is taken" />
      <span {...api.getHelperTextProps()}>Validation runs 400ms after you stop typing.</span>
      <span {...api.getErrorTextProps()}>{api.errors[0]}</span>
      <span {...api.getIndicatorProps({ type: "valid" })}>Looks good</span>
    </div>
    {#if api.validating}
      <span data-testid="validating">Checking…</span>
    {/if}
    <span data-testid="validate-calls">Checks: {calls}</span>
    <div class="actions">
      <button type="submit">Submit</button>
      <button
        type="reset"
        onclick={() => {
          clearTimeout(timer)
          calls = 0
        }}
      >
        Reset
      </button>
    </div>
  </form>
</main>

<Toolbar viz>
  <StateVisualizer state={service} />
</Toolbar>
