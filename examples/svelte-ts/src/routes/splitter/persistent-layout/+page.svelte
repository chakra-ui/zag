<script lang="ts">
  import { usePersistentMapState } from "#lib/use-persistent-state.svelte.ts"
  import * as splitter from "@zag-js/splitter"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { isEqual } from "@zag-js/utils"
  import "@styles/splitter.css"

  let showInspector = $state(true)

  const panels = $derived(
    [
      { id: "nav", minSize: 20 },
      { id: "content", minSize: 30 },
      showInspector && { id: "inspector", minSize: 20 },
    ].filter(Boolean) as splitter.PanelData[],
  )

  const persisted = usePersistentMapState<number[]>({
    storageKey: "zag:splitter:persistent-layout",
    key: () => splitter.layout(panels),
    defaultValue: [],
  })

  const id = $props.id()
  const service = useMachine(splitter.machine, () => ({
    id,
    panels,
    size: persisted.value,
    onResize: (details: splitter.ResizeDetails) => persisted.setValue(details.size),
  }))

  const api = $derived(splitter.connect(service, normalizeProps))

  const ready = $derived(
    persisted.hydrated && (persisted.value.length === 0 || isEqual(api.getSizes(), persisted.value)),
  )
</script>

<main class="splitter" style:visibility={ready ? "visible" : "hidden"}>
  <pre>{JSON.stringify(api.getSizes())}</pre>
  <button onclick={() => (showInspector = !showInspector)}>
    {showInspector ? "Hide Inspector" : "Show Inspector"}
  </button>

  <div {...api.getRootProps()}>
    <div {...api.getPanelProps({ id: "nav" })}>
      <p>Nav</p>
    </div>
    <div {...api.getResizeTriggerProps({ id: "nav:content" })}></div>
    <div {...api.getPanelProps({ id: "content" })}>
      <p>Content</p>
    </div>
    {#if showInspector}
      <div {...api.getResizeTriggerProps({ id: "content:inspector" })}></div>
      <div {...api.getPanelProps({ id: "inspector" })}>
        <p>Inspector</p>
      </div>
    {/if}
  </div>
</main>
