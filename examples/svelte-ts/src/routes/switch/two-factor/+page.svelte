<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as zagSwitch from "@zag-js/switch"
  import "@styles/switch.css"

  const id = $props.id()
  let checked = $state(false)
  let submitted = $state(false)
  let saved = $state(false)

  const invalid = $derived(submitted && !checked)
  const descriptionId = `${id}-description`
  const errorId = `${id}-error`

  const service = useMachine(zagSwitch.machine, () => ({
    id,
    required: true,
    invalid,
    onCheckedChange: (details) => {
      checked = details.checked
      saved = false
    },
  }))

  const api = $derived(zagSwitch.connect(service, normalizeProps))
</script>

<main>
  <div class="switch-two-factor">
    <p class="hint">Save with it off to see the error.</p>
    <form
      novalidate
      onsubmit={(e) => {
        e.preventDefault()
        submitted = true
        saved = checked
      }}
    >
      <div class="field">
        <!-- svelte-ignore a11y_label_has_associated_control -->
        <label data-testid="switch-two-factor" {...api.getRootProps()}>
          <input
            {...api.getHiddenInputProps()}
            aria-describedby={invalid ? `${descriptionId} ${errorId}` : descriptionId}
          />
          <span {...api.getControlProps()}>
            <span {...api.getThumbProps()}></span>
          </span>
          <span {...api.getLabelProps()}>Two-factor authentication</span>
        </label>
        <p class="description" id={descriptionId}>
          Ask for a 6-digit code from your authenticator app when you sign in.
        </p>
        {#if invalid}
          <p class="error" id={errorId} role="alert">Turn on two-factor authentication to continue.</p>
        {/if}
      </div>
      <div class="actions">
        <button type="submit">Save security settings</button>
      </div>
    </form>
    {#if saved}
      <p class="status" role="status">Two-factor authentication is on.</p>
    {/if}
  </div>
</main>

<Toolbar viz>
  <StateVisualizer state={service} />
</Toolbar>
