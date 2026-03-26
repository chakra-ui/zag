<script lang="ts">
  import styles from "../../../../../../shared/src/css/signature-pad.module.css"
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

  const id = $props.id()
  const service = useMachine(
    signaturePad.machine,
    controls.mergeProps<signaturePad.Props>({
      id,
      onDrawEnd(details) {
        details.getDataUrl("image/png").then(setUrl)
      },
      drawing: {
        fill: "red",
        size: 4,
        simulatePressure: true,
      },
    }),
  )

  const api = $derived(signaturePad.connect(service, normalizeProps))
</script>

<main class="signature-pad">
  <div {...api.getRootProps()} class={styles.Root}>
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label {...api.getLabelProps()} class={styles.Label}>Signature Pad</label>

    <div {...api.getControlProps()} class={styles.Control}>
      <svg {...api.getSegmentProps()}>
        {#each api.paths as path}
          <path {...api.getSegmentPathProps({ path })} />
        {/each}
        {#if api.currentPath}
          <path {...api.getSegmentPathProps({ path: api.currentPath })} />
        {/if}
      </svg>

      <div {...api.getGuideProps()} class={styles.Guide}></div>
    </div>

    <button {...api.getClearTriggerProps()} class={styles.ClearTrigger}>
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
  <StateVisualizer state={service} omit={["currentPoints", "currentPath", "paths"]} />
</Toolbar>
