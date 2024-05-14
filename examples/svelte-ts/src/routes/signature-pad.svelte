<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import { signaturePadControls } from "@zag-js/shared"
  import * as signaturePad from "@zag-js/signature-pad"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { RotateCcw } from "lucide-svelte"

  const controls = useControls(signaturePadControls)

  let url = $state("")
  const setUrl = (value: string) => (url = value)

  const [snapshot, send] = useMachine(
    signaturePad.machine({
      id: "1",
      onDrawEnd(details) {
        details.getDataUrl("image/png").then(setUrl)
      },
      drawing: {
        fill: "red",
        size: 4,
        simulatePressure: true,
      },
    }),
    {
      context: controls.context,
    },
  )

  const api = $derived(signaturePad.connect(snapshot, send, normalizeProps))
</script>

<main class="signature-pad">
  <div {...api.rootProps}>
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label {...api.labelProps}>Signature Pad</label>

    <div {...api.controlProps}>
      <svg {...api.segmentProps}>
        {#each api.paths as path}
          <path {...api.getSegmentPathProps({ path })} />
        {/each}
        {#if api.currentPath}
          <path {...api.getSegmentPathProps({ path: api.currentPath })} />
        {/if}
      </svg>

      <div {...api.guideProps}></div>
    </div>

    <button {...api.clearTriggerProps}>
      <RotateCcw />
    </button>
  </div>

  <button
    onclick={() => {
      api.getDataUrl("image/png").then(setUrl)
    }}
  >
    Show Image
  </button>

  {#if url}
    <img data-part="preview" alt="signature" src={url} />
  {/if}
</main>

<Toolbar {controls}>
  <StateVisualizer state={snapshot} />
</Toolbar>
