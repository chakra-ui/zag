<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as floatingPanel from "@zag-js/floating-panel"
  import { floatingPanelControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { ArrowDownLeft, Maximize2, Minus, XIcon } from "lucide-svelte"

  const controls = useControls(floatingPanelControls)

  const [snapshot, send] = useMachine(floatingPanel.machine({ id: "1" }), {
    context: controls.context,
  })

  const api = $derived(floatingPanel.connect(snapshot, send, normalizeProps))
</script>

<main class="floating-panel">
  <div>
    <button {...api.getTriggerProps()}>Toggle Panel</button>
    <div {...api.getPositionerProps()}>
      <div {...api.getContentProps()}>
        <div {...api.getDragTriggerProps()}>
          <div {...api.getHeaderProps()}>
            <p {...api.getTitleProps()}>Floating Panel</p>
            <div data-scope="floating-panel" data-part="trigger-group">
              <button {...api.getMinimizeTriggerProps()}>
                <Minus />
              </button>
              <button {...api.getMaximizeTriggerProps()}>
                <Maximize2 />
              </button>
              <button {...api.getRestoreTriggerProps()}>
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

        <div {...api.getResizeTriggerProps({ axis: "n" })}></div>
        <div {...api.getResizeTriggerProps({ axis: "e" })}></div>
        <div {...api.getResizeTriggerProps({ axis: "w" })}></div>
        <div {...api.getResizeTriggerProps({ axis: "s" })}></div>
        <div {...api.getResizeTriggerProps({ axis: "ne" })}></div>
        <div {...api.getResizeTriggerProps({ axis: "se" })}></div>
        <div {...api.getResizeTriggerProps({ axis: "sw" })}></div>
        <div {...api.getResizeTriggerProps({ axis: "nw" })}></div>
      </div>
    </div>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={snapshot} />
</Toolbar>
