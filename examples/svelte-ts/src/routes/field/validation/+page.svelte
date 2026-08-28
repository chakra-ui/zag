<script lang="ts">
  import * as field from "@zag-js/field"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import "@styles/field.css"

  const TAKEN_EMAILS = ["taken@example.com"]

  const checkEmail = (value: string) => (TAKEN_EMAILS.includes(value) ? "This email is already taken" : null)

  let mode = $state<field.ValidationMode>("onSubmit")
  let isAsync = $state(false)
  let submitted = $state(false)

  const id = $props.id()
  const service = useMachine(field.machine, () => ({
    id,
    required: true,
    validationMode: mode,
    validate({ value }: field.ValidateDetails) {
      if (!isAsync) return checkEmail(value)
      return new Promise<field.ValidateResult>((resolve) => setTimeout(() => resolve(checkEmail(value)), 400))
    },
  }))

  const api = $derived(field.connect(service, normalizeProps))
</script>

<main class="field-page">
  <h1>Field — Validation</h1>
  <div class="options">
    <label>
      Mode
      <select bind:value={mode}>
        <option value="onSubmit">onSubmit</option>
        <option value="onBlur">onBlur</option>
        <option value="onChange">onChange</option>
      </select>
    </label>
    <label> <input type="checkbox" bind:checked={isAsync} /> Async validation </label>
  </div>
  <form
    onsubmit={(e) => {
      e.preventDefault()
      submitted = true
    }}
  >
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>
        Email <span {...api.getIndicatorProps({ type: "required" })}>*</span>
      </label>
      <input {...api.getInputProps()} type="email" placeholder="taken@example.com is taken" />
      <span {...api.getHelperTextProps()}>We never share your email.</span>
      <span {...api.getErrorTextProps()}>{api.errors[0]}</span>
      <span {...api.getIndicatorProps({ type: "valid" })}>Looks good</span>
    </div>
    {#if api.validating}
      <span data-testid="validating">Checking…</span>
    {/if}
    {#if submitted}
      <span data-testid="submitted">Submitted!</span>
    {/if}
    <div class="actions">
      <button type="submit">Submit</button>
      <button type="reset" onclick={() => (submitted = false)}>Reset</button>
    </div>
  </form>
</main>

<Toolbar viz>
  <StateVisualizer state={service} />
</Toolbar>
