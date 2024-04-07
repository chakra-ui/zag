<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as floatingPanel from "@zag-js/floating-panel"
  import { floatingPanelControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { ArrowDownLeft, Maximize2, Minus, XIcon } from "lucide-svelte"

  const controls = useControls(floatingPanelControls)

  const [_state, send] = useMachine(floatingPanel.machine({ id: "1" }), {
    context: controls.context,
  })

  const api = $derived(floatingPanel.connect(_state, send, normalizeProps))
</script>

<main class="floating-panel">
  <div>
    <button {...api.triggerProps}>Toggle Panel</button>
    <div {...api.positionerProps}>
      <div {...api.contentProps}>
        <div {...api.dragTriggerProps}>
          <div {...api.headerProps}>
            <p {...api.titleProps}>Floating Panel</p>
            <div data-scope="floating-panel" data-part="trigger-group">
              <button {...api.minimizeTriggerProps}>
                <Minus />
              </button>
              <button {...api.maximizeTriggerProps}>
                <Maximize2 />
              </button>
              <button {...api.restoreTriggerProps}>
                <ArrowDownLeft />
              </button>
              <button {...api.closeTriggerProps}>
                <XIcon />
              </button>
            </div>
          </div>
        </div>
        <div {...api.bodyProps}>
          <p>Some content</p>
        </div>

        <div {...api.getResizeTriggerProps({ axis: "n" })} />
        <div {...api.getResizeTriggerProps({ axis: "e" })} />
        <div {...api.getResizeTriggerProps({ axis: "w" })} />
        <div {...api.getResizeTriggerProps({ axis: "s" })} />
        <div {...api.getResizeTriggerProps({ axis: "ne" })} />
        <div {...api.getResizeTriggerProps({ axis: "se" })} />
        <div {...api.getResizeTriggerProps({ axis: "sw" })} />
        <div {...api.getResizeTriggerProps({ axis: "nw" })} />
      </div>
    </div>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={_state} />
</Toolbar>
