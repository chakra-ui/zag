<script lang="ts">
  import * as splitter from "@zag-js/splitter"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/splitter.css"

  const id = $props.id()
  const service = useMachine(splitter.machine, {
    id,
    defaultSize: [50, 50],
    panels: [
      { id: "left", minSize: 20 },
      { id: "right", minSize: 20 },
    ],
  })

  const api = $derived(splitter.connect(service, normalizeProps))
</script>

<main class="splitter">
  <pre>{JSON.stringify(api.getSizes())}</pre>
  <div {...api.getRootProps()}>
    <div {...api.getPanelProps({ id: "left" })}>
      <p>Left</p>
    </div>
    <div {...api.getResizeTriggerProps({ id: "left:" })}></div>
    <div
      style="flex: 0 0 180px; width: 180px; display: grid; place-items: center; overflow: auto; background: #334155; color: white; padding: 16px"
    >
      Fixed sized element
    </div>
    <div {...api.getResizeTriggerProps({ id: ":right" })}></div>
    <div {...api.getPanelProps({ id: "right" })}>
      <p>Right</p>
    </div>
  </div>
</main>
