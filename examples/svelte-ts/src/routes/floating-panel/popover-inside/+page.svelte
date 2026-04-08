<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import * as floatingPanel from "@zag-js/floating-panel"
  import * as popover from "@zag-js/popover"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { ArrowDownLeft, Maximize2, Minus, XIcon } from "lucide-svelte"

  const id = $props.id()
  const service = useMachine(floatingPanel.machine, () => ({
    id,
    closeOnEscape: true,
    defaultSize: { width: 400, height: 300 },
  }))

  const api = $derived(floatingPanel.connect(service, normalizeProps))

  const popoverService = useMachine(popover.machine, () => ({
    id: `${id}-popover`,
    portalled: false,
  }))

  const popoverApi = $derived(popover.connect(popoverService, normalizeProps))
</script>

<main class="floating-panel">
  <div>
    <button {...api.getTriggerProps()}>Toggle Panel</button>
    <div {...api.getPositionerProps()}>
      <div {...api.getContentProps()}>
        <div {...api.getDragTriggerProps()}>
          <div {...api.getHeaderProps()}>
            <p {...api.getTitleProps()}>Floating Panel (Nested Popover)</p>
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
          <p>Escape closes the popover first, then the panel.</p>
          <div>
            <button {...popoverApi.getTriggerProps()}>Open Popover</button>
            <div {...popoverApi.getPositionerProps()}>
              <div {...popoverApi.getContentProps()}>
                <div {...popoverApi.getTitleProps()}>Nested Popover</div>
                <div {...popoverApi.getDescriptionProps()}>
                  Press Escape to close this popover without closing the panel.
                </div>
                <button {...popoverApi.getCloseTriggerProps()}>Close Popover</button>
              </div>
            </div>
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
