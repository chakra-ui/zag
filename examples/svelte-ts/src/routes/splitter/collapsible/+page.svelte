<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import { splitterControls } from "@zag-js/shared"
  import * as splitter from "@zag-js/splitter"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/splitter.css"

  const controls = useControls(splitterControls)

  const id = $props.id()
  const service = useMachine(splitter.machine, {
    id,
    panels: [
      { id: "a", collapsible: true, collapsedSize: 5, minSize: 10, maxSize: 20 },
      { id: "b", minSize: 50 },
    ],
    defaultSize: [15, 85],
    onCollapse: (details) => {
      console.log("onCollapse", details)
    },
    onExpand: (details) => {
      console.log("onExpand", details)
    },
  })

  const api = $derived(splitter.connect(service, normalizeProps))
</script>

<main class="splitter">
  <div {...api.getRootProps()}>
    <div {...api.getPanelProps({ id: "a" })}>
      <p>A</p>
    </div>
    <div {...api.getResizeTriggerProps({ id: "a:b" })}></div>
    <div {...api.getPanelProps({ id: "b" })}>
      <p>B</p>
    </div>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
