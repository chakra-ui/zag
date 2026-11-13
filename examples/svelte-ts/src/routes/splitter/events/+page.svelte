<script lang="ts">
  import * as splitter from "@zag-js/splitter"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/splitter.css"

  let disabled = $state(false)
  let lockA = $state(false)
  let disableAll = $state(false)
  let resizeCount = $state(0)
  let resizeEnd = $state<string[]>([])
  let collapseLog = $state<string[]>([])

  const id = $props.id()
  const service = useMachine(splitter.machine, () => ({
    id,
    defaultSize: [25, 50, 25],
    disabled: disableAll,
    panels: [
      { id: "a", collapsible: true, collapsedSize: 5, minSize: 10, maxSize: 40, disabled: lockA },
      { id: "b", minSize: 20 },
      { id: "c", minSize: 20 },
    ],
    onResize() {
      resizeCount++
    },
    onResizeEnd({ size }) {
      resizeEnd = [...resizeEnd, size.map(Math.round).join("/")]
    },
    onCollapse({ panelId }) {
      collapseLog = [...collapseLog, `collapse:${panelId}`]
    },
    onExpand({ panelId }) {
      collapseLog = [...collapseLog, `expand:${panelId}`]
    },
  }))

  const api = $derived(splitter.connect(service, normalizeProps))
</script>

<main class="splitter">
  <div class="controls">
    <button onclick={() => api.collapsePanel("a")}>Collapse A</button>
    <button onclick={() => api.expandPanel("a")}>Expand A</button>
    <button onclick={() => (disabled = !disabled)}>{disabled ? "Enable" : "Disable"} second handle</button>
    <button onclick={() => api.resizePanel("a", "200px")}>Resize A to 200px</button>
    <button onclick={() => (lockA = !lockA)}>{lockA ? "Unlock" : "Lock"} A</button>
    <button onclick={() => (disableAll = !disableAll)}>{disableAll ? "Enable" : "Disable"} splitter</button>
  </div>

  <div {...api.getRootProps()}>
    <div {...api.getPanelProps({ id: "a" })}>
      <p>A</p>
    </div>
    <div {...api.getResizeTriggerProps({ id: "a:b" })}></div>
    <div {...api.getPanelProps({ id: "b" })}>
      <p>B</p>
    </div>
    <div {...api.getResizeTriggerProps({ id: "b:c", disabled })}></div>
    <div {...api.getPanelProps({ id: "c" })}>
      <p>C</p>
    </div>
  </div>

  <p>Sizes: <output aria-label="Sizes">{api.getSizes().map(Math.round).join("/")}</output></p>
  <p>onResize calls: <output aria-label="Resize count">{resizeCount}</output></p>
  <p>onResizeEnd: <output aria-label="Resize end reports">{resizeEnd.join(",") || "-"}</output></p>
  <p>onCollapse / onExpand: <output aria-label="Collapse reports">{collapseLog.join(",") || "-"}</output></p>
</main>
