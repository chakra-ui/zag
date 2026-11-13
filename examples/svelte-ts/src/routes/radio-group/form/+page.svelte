<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import * as radio from "@zag-js/radio-group"
  import { contactMethods } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/radio-group.css"

  let value = $state<string | null>(null)
  let submitted = $state(false)
  let output = $state("")

  const invalid = $derived(submitted && !value)

  const id = $props.id()
  const service = useMachine(radio.machine, () => ({
    id,
    name: "contact",
    defaultValue: null,
    required: true,
    invalid,
    onValueChange: (details: radio.ValueChangeDetails) => {
      value = details.value
    },
  }))

  const api = $derived(radio.connect(service, normalizeProps))
</script>

<main>
  <div class="radio-form">
    <p class="hint">Save without choosing to see the invalid state, then pick one.</p>
    <form
      novalidate
      onsubmit={(e) => {
        e.preventDefault()
        submitted = true
        const data = Object.fromEntries(new FormData(e.currentTarget))
        output = "contact" in data ? JSON.stringify(data, null, 2) : ""
      }}
      onreset={() => {
        submitted = false
        output = ""
      }}
    >
      <div {...api.getRootProps()}>
        <span {...api.getLabelProps()}>Preferred contact method</span>
        {#each contactMethods as opt (opt.id)}
          <label data-testid={`radio-${opt.id}`} {...api.getItemProps({ value: opt.id })}>
            <div {...api.getItemControlProps({ value: opt.id })}></div>
            <span {...api.getItemTextProps({ value: opt.id })}>{opt.label}</span>
            <input {...api.getItemHiddenInputProps({ value: opt.id })} />
          </label>
        {/each}
      </div>
      {#if invalid}
        <p class="error" role="alert">Choose a contact method.</p>
      {/if}
      <div class="actions">
        <button type="submit">Save preference</button>
        <button type="reset">Reset</button>
      </div>
    </form>
    {#if output}
      <pre class="output" data-testid="form-output">{output}</pre>
    {/if}
  </div>
</main>

<Toolbar viz>
  <StateVisualizer state={service} />
</Toolbar>
