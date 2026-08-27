<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import * as signaturePad from "@zag-js/signature-pad"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { RotateCcw } from "lucide-svelte"

  let paths = $state<string[]>([])
  let url = $state("")
  const setUrl = (value: string) => (url = value)

  const id = $props.id()
  const service = useMachine(signaturePad.machine, {
    id,
    get paths() {
      return paths
    },
    onDraw(details) {
      paths = details.paths
    },
    onDrawEnd(details) {
      details.getDataUrl("image/png").then(setUrl)
    },
    drawing: {
      fill: "red",
      size: 4,
      simulatePressure: true,
    },
  })

  const api = $derived(signaturePad.connect(service, normalizeProps))
</script>

<main class="signature-pad">
  <div {...api.getRootProps()}>
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label {...api.getLabelProps()}>Controlled Signature Pad</label>

    <div {...api.getControlProps()}>
      <svg {...api.getSegmentProps()}>
        {#each api.paths as path}
          <path {...api.getSegmentPathProps({ path })} />
        {/each}
        {#if api.currentPath}
          <path {...api.getSegmentPathProps({ path: api.currentPath })} />
        {/if}
      </svg>

      <div {...api.getGuideProps()}></div>
    </div>

    <button {...api.getClearTriggerProps()}>
      <RotateCcw />
    </button>
  </div>

  <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem">
    <button data-testid="clear-paths" type="button" onclick={() => (paths = [])}>Clear (controlled)</button>
    <button
      type="button"
      onclick={() => {
        api.getDataUrl("image/png").then(setUrl)
      }}
    >
      Show Image
    </button>
  </div>

  <div
    data-testid="controlled-status"
    style="margin-top: 1rem; padding: 0.5rem; background: #f5f5f5; border-radius: 4px"
  >
    <div><strong>Paths:</strong> {paths.length}</div>
    <div><strong>Drawing:</strong> {api.drawing ? "yes" : "no"}</div>
    <div><strong>Current path:</strong> {api.currentPath ? "active" : "none"}</div>
  </div>

  {#if url}
    <img data-part="preview" alt="signature" src={url} />
  {/if}
</main>

<Toolbar>
  <StateVisualizer state={service} context={["paths", "currentPath"]} omit={["currentPoints"]} />
</Toolbar>
