<script lang="ts">
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { splitterControls } from "@zag-js/shared"
  import * as splitter from "@zag-js/splitter"
  import { useControls } from "$lib/use-controls.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"

  const controls = useControls(splitterControls)

  const service = useMachine(splitter.machine, {
    id: "1",
    defaultSize: [
      { id: "a", size: 50 },
      { id: "b", size: 50 },
    ],
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

<Toolbar {controls} viz>
  <StateVisualizer state={service} omit={["previousPanels", "initialSize"]} />
</Toolbar>
