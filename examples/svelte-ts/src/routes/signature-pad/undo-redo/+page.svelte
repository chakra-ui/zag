<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import * as signaturePad from "@zag-js/signature-pad"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { RotateCcwIcon } from "lucide-svelte"
  import "@styles/signature-pad.css"

  let paths = $state<string[]>([])
  let undone = $state<string[]>([])

  const id = $props.id()
  const service = useMachine(signaturePad.machine, {
    id,
    get paths() {
      return paths
    },
    onDraw(details) {
      paths = details.paths
    },
    onDrawEnd() {
      undone = []
    },
  })
  const api = $derived(signaturePad.connect(service, normalizeProps))

  function undo() {
    const last = paths.at(-1)
    if (!last) return
    undone = [...undone, last]
    paths = paths.slice(0, -1)
  }

  function redo() {
    const last = undone.at(-1)
    if (!last) return
    paths = [...paths, last]
    undone = undone.slice(0, -1)
  }
</script>

<main>
  <div class="signature-pad-undo-redo">
    <div {...api.getRootProps()}>
      <!-- svelte-ignore a11y_label_has_associated_control -->
      <label {...api.getLabelProps()}>Signature</label>
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
    <div class="actions">
      <button type="button" disabled={paths.length === 0} onclick={undo}>Undo</button>
      <button type="button" disabled={undone.length === 0} onclick={redo}>Redo</button>
      <span>{paths.length} {paths.length === 1 ? "stroke" : "strokes"}</span>
    </div>
  </div>
</main>

<Toolbar viz>
  <StateVisualizer state={service} omit={["currentPoints", "currentPath", "paths"]} />
</Toolbar>
