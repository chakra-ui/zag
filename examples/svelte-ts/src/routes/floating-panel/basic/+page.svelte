<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as floatingPanel from "@zag-js/floating-panel"
  import { floatingPanelControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { ArrowDownLeft, Maximize2, Minus, XIcon } from "lucide-svelte"

  const controls = useControls(floatingPanelControls)

  const id = $props.id()
  const service = useMachine(floatingPanel.machine, controls.mergeProps<floatingPanel.Props>({ id }))

  const api = $derived(floatingPanel.connect(service, normalizeProps))
</script>

<main class="floating-panel">
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
          <p>Some content</p>
        </div>

        {#each floatingPanel.resizeTriggerAxes as axis}
          <div {...api.getResizeTriggerProps({ axis })}></div>
        {/each}
      </div>
    </div>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
