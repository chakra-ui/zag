<script lang="ts">
  import styles from "../../../../../../shared/src/css/splitter.module.css"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { splitterControls } from "@zag-js/shared"
  import * as splitter from "@zag-js/splitter"
  import { useControls } from "$lib/use-controls.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"

  const controls = useControls(splitterControls)

  const id = $props.id()
  const service = useMachine(
    splitter.machine,
    controls.mergeProps<splitter.Props>({
      id,
      panels: [{ id: "a" }, { id: "b" }],
    }),
  )

  const api = $derived(splitter.connect(service, normalizeProps))
</script>

<main class="splitter">
  <div {...api.getRootProps()} class={styles.Root}>
    <div {...api.getPanelProps({ id: "a" })} class={styles.Panel}>
      <p>A</p>
    </div>
    <div {...api.getResizeTriggerProps({ id: "a:b" })} class={styles.ResizeTrigger}></div>
    <div {...api.getPanelProps({ id: "b" })} class={styles.Panel}>
      <p>B</p>
    </div>
  </div>
</main>

<Toolbar {controls} viz>
  <StateVisualizer state={service} omit={["previousPanels", "initialSize"]} />
</Toolbar>
