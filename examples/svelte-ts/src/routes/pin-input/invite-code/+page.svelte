<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import * as pinInput from "@zag-js/pin-input"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/pin-input.css"

  let rejected = $state(false)
  let output = $state("")

  const id = $props.id()
  const service = useMachine(pinInput.machine, {
    id,
    name: "invite",
    count: 6,
    type: "alphanumeric",
    autoSubmit: true,
    normalizeValue: (value) => value.toUpperCase(),
    translations: { inputLabel: (index, length) => `Character ${index + 1} of ${length}` },
    onValueChange: () => (rejected = false),
    onValueInvalid: () => (rejected = true),
  })
  const api = $derived(pinInput.connect(service, normalizeProps))

  function onsubmit(event: SubmitEvent & { currentTarget: HTMLFormElement }) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    output = [...data.entries()].map(([key, value]) => `${key}=${value}`).join("\n")
  }
</script>

<main>
  <div class="pin-input-invite-code">
    <p class="hint">Enter the 6-character code from your invite. It joins as soon as the last box is filled.</p>
    <form {onsubmit}>
      <div {...api.getRootProps()}>
        <!-- svelte-ignore a11y_label_has_associated_control -->
        <label {...api.getLabelProps()}>Invite code</label>
        <div {...api.getControlProps()}>
          {#each api.items as index (index)}
            {#if index === 3}
              <span class="separator" aria-hidden="true">–</span>
            {/if}
            <input {...api.getInputProps({ index })} />
          {/each}
        </div>
        <input {...api.getHiddenInputProps()} />
      </div>
      {#if rejected}
        <p class="error" role="alert">Use letters and numbers only</p>
      {/if}
      <button type="submit">Join team</button>
    </form>
    {#if output}
      <pre data-testid="form-output">{output}</pre>
    {/if}
  </div>
</main>

<Toolbar viz>
  <StateVisualizer state={service} context={["value", "focusedIndex"]} />
</Toolbar>
