<script lang="ts">
  import * as floatingPanel from "@zag-js/floating-panel"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { ArrowDownLeft, Maximize2, Minus, XIcon } from "lucide-svelte"

  let boundaryEl = $state<HTMLElement | null>(null)

  const id = $props.id()
  const service = useMachine(floatingPanel.machine, {
    id,
    getBoundaryEl: () => boundaryEl,
  })

  const api = $derived(floatingPanel.connect(service, normalizeProps))
</script>

<main class="floating-panel">
  <div class="scroll-area" data-testid="scroller">
    <p>Scroll this area. The panel stays inside the dashed boundary.</p>
    <div class="scroll-spacer"></div>
    <div class="boundary" bind:this={boundaryEl} data-testid="boundary">
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
            <p>Some content</p>
          </div>

          {#each floatingPanel.resizeTriggerAxes as axis}
            <div {...api.getResizeTriggerProps({ axis })}></div>
          {/each}
        </div>
      </div>
    </div>
    <div class="scroll-spacer"></div>
  </div>
</main>
