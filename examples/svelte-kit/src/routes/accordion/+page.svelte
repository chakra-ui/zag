<script>
  import * as accordion from "@zag-js/accordion"
  import { accordionControls, accordionData } from "@zag-js/shared"
  import { events, normalizeProps, useMachine } from "@zag-js/svelte"
  import StateVisualizer from "../../components/state-visualizer.svelte"
  import Toolbar from "../../components/toolbar.svelte"

  import { useControls } from "../../stores/controls/context"
  import ControlsUI from "../../stores/controls/ui.svelte"

  const ctx = useControls(accordionControls)

  const [state, send] = useMachine(accordion.machine({ id: "accordion" }), { context: $ctx })

  $: api = accordion.connect($state, send, normalizeProps)
</script>

<main class="accordion">
  <div use:events={api.rootProps.handlers} {...api.rootProps.attributes}>
    {#each accordionData as item}
      <div
        use:events={api.getItemProps({ value: item.id }).handlers}
        {...api.getItemProps({ value: item.id }).attributes}
      >
        <h3>
          <button
            data-testid={`${item.id}:trigger`}
            use:events={api.getTriggerProps({ value: item.id }).handlers}
            {...api.getTriggerProps({ value: item.id }).attributes}
          >
            {item.label}
          </button>
        </h3>
        <div
          data-testid={`${item.id}:content`}
          use:events={api.getContentProps({ value: item.id }).handlers}
          {...api.getContentProps({ value: item.id }).attributes}
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
          magna aliqua.
        </div>
      </div>
    {/each}
  </div>
</main>

<Toolbar>
  <ControlsUI slot="controls" {ctx} controls={accordionControls} />
  <StateVisualizer state={$state} />
</Toolbar>
