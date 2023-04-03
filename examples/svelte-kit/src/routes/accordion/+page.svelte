<script lang="ts">
  import * as accordion from "@zag-js/accordion"
  import { events, normalizeProps, useMachine } from "@zag-js/svelte"
  import StateVisualizer from "../../components/state-visualizer.svelte"
  import Toolbar from "../../components/toolbar.svelte"

  const accordionData = [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
    { id: "contact", label: "Contact" },
  ]

  const [state, send] = useMachine(accordion.machine({ id: "accordion" }))

  $: api = accordion.connect($state, send, normalizeProps)
</script>

<main class="accordion">
  <div {...api.rootProps.attrs} use:events={api.rootProps.handlers}>
    {#each accordionData as item}
      <div {...api.getItemProps({ value: item.id }).attrs} use:events={api.getItemProps({ value: item.id }).handlers}>
        <button
          data-testid={`${item.id}:trigger`}
          {...api.getTriggerProps({ value: item.id }).attrs}
          use:events={api.getTriggerProps({ value: item.id }).handlers}
        >
          {item.label}
        </button>
        <div
          {...api.getContentProps({ value: item.id }).attrs}
          use:events={api.getContentProps({ value: item.id }).handlers}
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
