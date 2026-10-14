<script lang="ts">
  import * as splitter from "@zag-js/splitter"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/splitter.css"

  const id = $props.id()
  const service = useMachine(splitter.machine, {
    id,
    defaultSize: ["240px", "60vw"],
    panels: [
      { id: "sidebar", minSize: "240px", maxSize: "360px" },
      { id: "content", minSize: 20 },
    ],
  })

  const api = $derived(splitter.connect(service, normalizeProps))
</script>

<main class="splitter">
  <pre>{JSON.stringify(api.getSizes())}</pre>
  <div {...api.getRootProps()}>
    <div {...api.getPanelProps({ id: "sidebar" })}>
      <p>Sidebar: 240px - 360px</p>
    </div>
    <div {...api.getResizeTriggerProps({ id: "sidebar:content" })}></div>
    <div {...api.getPanelProps({ id: "content" })}>
      <p>Content</p>
    </div>
  </div>
</main>
