<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import * as floatingPanel from "@zag-js/floating-panel"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { ArrowDownLeft, Maximize2, Minus, XIcon } from "lucide-svelte"
  import { onDestroy, onMount } from "svelte"

  const id = $props.id()
  let open = $state(false)
  let size = $state({ width: 360, height: 260 })
  let position = $state({ x: 120, y: 120 })
  let observedSize = $state({ width: 0, height: 0 })

  let observedEl = $state<HTMLDivElement | null>(null)
  let observer: ResizeObserver | null = null

  onMount(() => {
    observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      observedSize = { width: Math.round(width), height: Math.round(height) }
    })
    if (observedEl) observer.observe(observedEl)
  })

  onDestroy(() => {
    observer?.disconnect()
    observer = null
  })

  const service = useMachine(floatingPanel.machine, {
    id,
    defaultOpen: true,
    get open() {
      return open
    },
    get size() {
      return size
    },
    get position() {
      return position
    },
    onOpenChange(details) {
      open = details.open
    },
    onSizeChange(details) {
      size = details.size
    },
    onPositionChange(details) {
      position = details.position
    },
  })

  const api = $derived(floatingPanel.connect(service, normalizeProps))
</script>

<main class="floating-panel">
  <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem;">
    <button onclick={() => (open = !open)}>{open ? "Close" : "Open"} panel</button>
    <button onclick={() => (size = { width: 420, height: 320 })}>Set size: 420x320</button>
    <button onclick={() => (position = { x: 32, y: 32 })}>Set position: (32, 32)</button>
    <button onclick={() => api.setSize({ width: 440, height: 300 })}>API set size: 440x300</button>
    <button onclick={() => api.setPosition({ x: 48, y: 48 })}>API set position: (48, 48)</button>
    <button
      onclick={() => {
        size = { width: 360, height: 260 }
        position = { x: 120, y: 120 }
      }}
    >
      Reset rect
    </button>
  </div>

  <div style="margin-bottom: 1rem;">
    size: {Math.round(api.size.width)}x{Math.round(api.size.height)} | position: ({Math.round(api.position.x)}, {Math.round(
      api.position.y,
    )})
  </div>

  <div>
    <button {...api.getTriggerProps()}>Toggle Panel</button>
    <div {...api.getPositionerProps()}>
      <div {...api.getContentProps()}>
        <div {...api.getDragTriggerProps()}>
          <div {...api.getHeaderProps()}>
            <p {...api.getTitleProps()}>Floating Panel</p>
            <div {...api.getControlProps()}>
              <button {...api.getStageTriggerProps({ stage: "minimized" })}>
                <Minus />
              </button>
              <button {...api.getStageTriggerProps({ stage: "maximized" })}>
                <Maximize2 />
              </button>
              <button {...api.getStageTriggerProps({ stage: "default" })}>
                <ArrowDownLeft />
              </button>
              <button {...api.getCloseTriggerProps()}>
                <XIcon />
              </button>
            </div>
          </div>
        </div>
        <div {...api.getBodyProps()}>
          <p>Drag and resize to update external state.</p>
          <p>Use the buttons above for externally controlled size and position.</p>
          <div
            bind:this={observedEl}
            style="
              resize: horizontal;
              overflow: auto;
              min-width: 180px;
              max-width: 100%;
              padding: 0.5rem;
              border: 1px solid #d4d4d8;
              border-radius: 0.5rem;
            "
          >
            ResizeObserver box: {observedSize.width}x{observedSize.height}
          </div>
        </div>

        {#each floatingPanel.resizeTriggerPlacements as placement}
          <div {...api.getResizeTriggerProps({ placement })}></div>
        {/each}
      </div>
    </div>
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} />
</Toolbar>
