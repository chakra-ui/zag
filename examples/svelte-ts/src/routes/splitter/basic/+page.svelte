<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import { useControls } from "#lib/use-controls.svelte.ts"
  import { splitterControls } from "@zag-js/shared"
  import * as splitter from "@zag-js/splitter"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/splitter.css"

  const controls = useControls(splitterControls)

  const id = $props.id()
  const service = useMachine(
    splitter.machine,
    controls.mergeProps<splitter.Props>({
      id,
      panels: [{ id: "a" }, { id: "b" }, { id: "c" }],
    }),
  )

  const api = $derived(splitter.connect(service, normalizeProps))
</script>

<main class="splitter">
  <pre>{JSON.stringify(api.getSizes())}</pre>
  <div {...api.getRootProps()}>
    <div {...api.getPanelProps({ id: "a" })}>
      <p>Left</p>
    </div>
    <div data-testid="trigger-a:b" {...api.getResizeTriggerProps({ id: "a:b" })}></div>
    <div {...api.getPanelProps({ id: "b" })}>
      <p>Middle</p>
    </div>
    <div data-testid="trigger-b:c" {...api.getResizeTriggerProps({ id: "b:c" })}></div>
    <div {...api.getPanelProps({ id: "c" })}>
      <p>Right</p>
    </div>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
