<script lang="ts">
  import styles from "../../../../../../shared/src/css/floating-panel.module.css"
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
      <div {...api.getContentProps()} class={styles.Content}>
        <div {...api.getDragTriggerProps()}>
          <div {...api.getHeaderProps()} class={styles.Header}>
            <p {...api.getTitleProps()}>Floating Panel</p>
            <div {...api.getControlProps()} class={styles.Control}>
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
        <div {...api.getBodyProps()} class={styles.Body}>
          <p>Some content</p>
        </div>

        {#each floatingPanel.resizeTriggerAxes as axis}
          <div {...api.getResizeTriggerProps({ axis })} class={styles.ResizeTrigger}></div>
        {/each}
      </div>
    </div>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
