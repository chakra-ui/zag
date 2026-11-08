<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as zagSwitch from "@zag-js/switch"
  import "@styles/switch.css"

  let output = $state<string | null>(null)

  const id = $props.id()
  const service = useMachine(zagSwitch.machine, {
    id,
    name: "newsletter",
    value: "yes",
    required: true,
  })

  const api = $derived(zagSwitch.connect(service, normalizeProps))
</script>

<main>
  <div class="switch-form">
    <p class="hint">Turn it on and subscribe to see what the form sends, then reset.</p>
    <form
      novalidate
      onsubmit={(e) => {
        e.preventDefault()
        const params = new URLSearchParams(new FormData(e.currentTarget) as unknown as Record<string, string>)
        output = params.toString() || "(no fields sent)"
      }}
      onreset={() => (output = null)}
    >
      <!-- svelte-ignore a11y_label_has_associated_control -->
      <label data-testid="switch-newsletter" {...api.getRootProps()}>
        <input {...api.getHiddenInputProps()} />
        <span {...api.getControlProps()}>
          <span {...api.getThumbProps()}></span>
        </span>
        <span {...api.getLabelProps()}>Weekly newsletter</span>
      </label>
      <div class="actions">
        <button type="submit">Subscribe</button>
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
