<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import * as signaturePad from "@zag-js/signature-pad"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { RotateCcwIcon } from "lucide-svelte"
  import "@styles/signature-pad.css"

  let dataUrl = $state("")
  let showError = $state(false)
  let output = $state("")

  const id = $props.id()
  const service = useMachine(signaturePad.machine, {
    id,
    name: "signature",
    required: true,
    onDrawEnd(details) {
      showError = false
      details.getDataUrl("image/png").then((url) => (dataUrl = url))
    },
  })
  const api = $derived(signaturePad.connect(service, normalizeProps))

  function onsubmit(event: SubmitEvent & { currentTarget: HTMLFormElement }) {
    event.preventDefault()
    if (api.empty) {
      showError = true
      return
    }
    const data = new FormData(event.currentTarget)
    output = [...data.entries()]
      .map(([key, value]) => `${key}=${String(value).slice(0, key === "signature" ? 32 : undefined)}`)
      .join("\n")
  }

  function onreset() {
    api.clear()
    dataUrl = ""
    showError = false
    output = ""
  }
</script>

<main>
  <div class="signature-pad-sign-document">
    <p class="hint">Type your name and sign. The signature is submitted as a PNG data URL.</p>
    <form novalidate {onsubmit} {onreset}>
      <label class="field">
        <span>Full name</span>
        <input name="signer" autocomplete="name" />
      </label>

      <div {...api.getRootProps()}>
        <input {...api.getHiddenInputProps({ value: api.empty ? "" : dataUrl })} />
        <!-- svelte-ignore a11y_label_has_associated_control -->
        <label {...api.getLabelProps()}>Lease signature</label>
        <div {...api.getControlProps()}>
          <svg {...api.getSegmentProps()}>
            {#each api.paths as path, index (index)}
              <path {...api.getSegmentPathProps({ path })} />
            {/each}
            {#if api.currentPath}
              <path {...api.getSegmentPathProps({ path: api.currentPath })} />
            {/if}
          </svg>
          <div {...api.getGuideProps()}></div>
        </div>
        <button {...api.getClearTriggerProps()}>
          <RotateCcwIcon />
        </button>
      </div>
      {#if showError}
        <p class="error">Sign above to continue</p>
      {/if}

      <div class="actions">
        <button type="submit">Sign lease</button>
        <button type="reset">Start over</button>
      </div>
    </form>
    {#if output}
      <pre data-testid="form-output">{output}</pre>
    {/if}
  </div>
</main>

<Toolbar viz>
  <StateVisualizer state={service} omit={["currentPoints", "currentPath", "paths"]} />
</Toolbar>
