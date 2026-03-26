<script lang="ts">
  import styles from "../../../../../../shared/src/css/accordion.module.css"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as accordion from "@zag-js/accordion"
  import { accordionControls, accordionData } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { ChevronRight } from "lucide-svelte"

  const controls = useControls(accordionControls)

  const id = $props.id()
  const service = useMachine(accordion.machine, controls.mergeProps<accordion.Props>({ id }))

  const api = $derived(accordion.connect(service, normalizeProps))
</script>

<main class="accordion">
  <div {...api.getRootProps()} class={styles.Root}>
    {#each accordionData as item}
      <div {...api.getItemProps({ value: item.id })}>
        <h3>
          <button data-testid={`${item.id}:trigger`} {...api.getItemTriggerProps({ value: item.id })} class={styles.ItemTrigger}>
            {item.label}
            <div {...api.getItemIndicatorProps({ value: item.id })} class={styles.ItemIndicator}>
              <ChevronRight />
            </div>
          </button>
        </h3>
        <div data-testid={`${item.id}:content`} {...api.getItemContentProps({ value: item.id })} class={styles.ItemContent}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
          magna aliqua.
        </div>
      </div>
    {/each}
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
