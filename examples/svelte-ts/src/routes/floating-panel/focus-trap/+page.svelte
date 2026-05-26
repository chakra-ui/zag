<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import * as floatingPanel from "@zag-js/floating-panel"
  import { trapFocus } from "@zag-js/focus-trap"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { ArrowDownLeft, Maximize2, Minus, XIcon } from "lucide-svelte"

  const id = $props.id()
  const service = useMachine(floatingPanel.machine, () => ({ id, closeOnEscape: true }))

  const api = $derived(floatingPanel.connect(service, normalizeProps))

  let contentRef = $state<HTMLDivElement>()

  $effect(() => {
    if (!api.open || !contentRef) return

    return trapFocus(contentRef)
  })
</script>

<main class="floating-panel">
  <div>
    <button {...api.getTriggerProps()}>Toggle Panel</button>
    <div {...api.getPositionerProps()}>
      <div {...api.getContentProps()} bind:this={contentRef}>
        <div {...api.getDragTriggerProps()}>
          <div {...api.getHeaderProps()}>
            <p {...api.getTitleProps()}>Floating Panel (Focus Trap)</p>
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
          <p>Focus is trapped within this panel when open.</p>
          <label>
            Name
            <input type="text" placeholder="Enter name" />
          </label>
          <label>
            Email
            <input type="email" placeholder="Enter email" />
          </label>
          <button type="button">Submit</button>
        </div>

        {#each floatingPanel.resizeTriggerAxes as axis}
          <div {...api.getResizeTriggerProps({ axis })}></div>
        {/each}
      </div>
    </div>
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} />
</Toolbar>
