<script lang="ts">
  import * as accordion from "@zag-js/accordion"
  import { useMachine, normalizeProps, spreadRest } from "@zag-js/svelte"
  import StateVisualizer from "../components/state-visualizer.svelte"
  import Toolbar from "../components/toolbar.svelte"

  const accordionData = [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
    { id: "contact", label: "Contact" },
  ]

  const [state, send] = useMachine(accordion.machine({ id: "accordion" }))

  $: api = accordion.connect($state, send, normalizeProps)
</script>

<main class="accordion">
  <div use:spreadRest={api.rootProps} {...api.rootProps.attributes}>
    {#each accordionData as item}
      <div use:spreadRest={api.getItemProps({ value: item.id })} {...api.getItemProps({ value: item.id }).attributes}>
        <h3>
          <button
            data-testid={`${item.id}:trigger`}
            use:spreadRest={api.getTriggerProps({ value: item.id })}
            {...api.getTriggerProps({ value: item.id }).attributes}
          >
            {item.label}
          </button>
        </h3>
        <div
          data-testid={`${item.id}:content`}
          use:spreadRest={api.getContentProps({ value: item.id })}
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
  <StateVisualizer state={$state} />
</Toolbar>
