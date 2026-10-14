<script lang="ts">
  import * as splitter from "@zag-js/splitter"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/splitter.css"

  let hideLeft = $state(false)
  let hideRight = $state(false)

  const panels = $derived(
    [
      !hideLeft && { id: "left", minSize: 20 },
      { id: "center", minSize: 30 },
      !hideRight && { id: "right", minSize: 20 },
    ].filter(Boolean) as splitter.PanelData[],
  )

  const id = $props.id()
  const service = useMachine(splitter.machine, () => ({
    id,
    panels,
  }))

  const api = $derived(splitter.connect(service, normalizeProps))
</script>

<main class="splitter">
  <pre>{JSON.stringify(api.getSizes())}</pre>
  <button onclick={() => (hideLeft = !hideLeft)}>{hideLeft ? "Show Left" : "Hide Left"}</button>
  <button onclick={() => (hideRight = !hideRight)}>{hideRight ? "Show Right" : "Hide Right"}</button>

  <div {...api.getRootProps()}>
    {#if !hideLeft}
      <div {...api.getPanelProps({ id: "left" })}>
        <p>Left</p>
      </div>
      <div {...api.getResizeTriggerProps({ id: "left:center" })}></div>
    {/if}

    <div {...api.getPanelProps({ id: "center" })}>
      <p>Center</p>
    </div>

    {#if !hideRight}
      <div {...api.getResizeTriggerProps({ id: "center:right" })}></div>
      <div {...api.getPanelProps({ id: "right" })}>
        <p>Right</p>
      </div>
    {/if}
  </div>
</main>
