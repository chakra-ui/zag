<script lang="ts">
  import * as splitter from "@zag-js/splitter"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/splitter.css"

  let size = $state<number[]>([25, 50, 25])

  const id = $props.id()
  const service = useMachine(splitter.machine, () => ({
    id,
    panels: [
      { id: "left", minSize: 15 },
      { id: "center", minSize: 20 },
      { id: "right", minSize: 15 },
    ],
    size,
    onResize: (details: splitter.ResizeDetails) => {
      size = details.size
    },
  }))

  const api = $derived(splitter.connect(service, normalizeProps))
</script>

<main class="splitter">
  <pre>{JSON.stringify(size)}</pre>
  <div style="display: flex; gap: 8px; margin-bottom: 8px">
    <button onclick={() => (size = [25, 50, 25])}>Reset</button>
    <button onclick={() => (size = [50, 25, 25])}>Left wide</button>
    <button onclick={() => (size = [25, 25, 50])}>Right wide</button>
    <button onclick={() => (size = [15, 70, 15])}>Center wide</button>
  </div>

  <div {...api.getRootProps()}>
    <div {...api.getPanelProps({ id: "left" })}>
      <p>Left</p>
    </div>
    <div {...api.getResizeTriggerProps({ id: "left:center" })}></div>
    <div {...api.getPanelProps({ id: "center" })}>
      <p>Center</p>
    </div>
    <div {...api.getResizeTriggerProps({ id: "center:right" })}></div>
    <div {...api.getPanelProps({ id: "right" })}>
      <p>Right</p>
    </div>
  </div>
</main>
