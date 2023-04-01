<script lang="ts">
  import * as accordion from "@zag-js/accordion"
  import { attach, normalizeProps, useMachine } from "@zag-js/svelte"
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
  <div {...api.rootProps.attrs} use:attach={api.rootProps.rest}>
    {#each accordionData as item}
      <div 
        {...api.getItemProps({ value: item.id }).attrs} 
        use:attach={api.getItemProps({ value: item.id }).rest}>
        <h3>
          <button 
            data-testid={`${item.id}:trigger`} 
            {...api.getTriggerProps({ value: item.id }).attrs}
            use:attach={api.getTriggerProps({ value: item.id }).rest}
          >
            {item.label}
          </button>
        </h3>

        <div 
          data-testid={`${item.id}:content`} 
          {...api.getContentProps({ value: item.id }).attrs}
          use:attach={api.getContentProps({ value: item.id }).rest}
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
