<script lang="ts">
  import * as signaturePad from "@zag-js/signature-pad"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { signaturePadControls } from "@zag-js/shared"
  import { useControls } from "$lib/use-controls.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { RotateCcw } from "lucide-svelte"

  const controls = useControls(signaturePadControls)

  let url = $state("")
  const setUrl = (value: string) => (url = value)

  const [_state, send] = useMachine(
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

  const api = $derived(signaturePad.connect(_state, send, normalizeProps))
</script>

<main class="signature-pad">
  <div {...api.rootProps}>
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label {...api.labelProps}>Signature Pad</label>

    <div {...api.controlProps}>
      <svg {...api.layerProps}>
        {#each api.paths as path}
          <path {...api.getLayerPathProps({ path })} />
        {/each}
        {#if api.currentPath}
          <path {...api.getLayerPathProps({ path: api.currentPath })} />
        {/if}
      </svg>

      <div {...api.lineProps} />
    </div>

    <button {...api.clearTriggerProps}>
      <RotateCcw />
    </button>
  </div>

  <button
    onClick={() => {
      api.getDataUrl("image/png").then(setUrl)
    }}
  >
    Show Image
  </button>

  {#if url}
    <img data-part="preview" alt="signature" src={url} />
  {/if}
</main>

<Toolbar {controls} state={_state} />
