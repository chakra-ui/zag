<script lang="ts">
  import styles from "../../../../../../shared/src/css/tabs.module.css"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import { tabsControls, tabsData } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as tabs from "@zag-js/tabs"

  const controls = useControls(tabsControls)

  const id = $props.id()
  const service = useMachine(
    tabs.machine,
    controls.mergeProps<tabs.Props>({
      id,
      defaultValue: "nils",
    }),
  )

  const api = $derived(tabs.connect(service, normalizeProps))
</script>

<main class="tabs">
  <div {...api.getRootProps()} class={styles.Root}>
    <div {...api.getIndicatorProps()} class={styles.Indicator}></div>
    <div {...api.getListProps()} class={styles.List}>
      {#each tabsData as data}
        <button {...api.getTriggerProps({ value: data.id })} class={styles.Trigger} data-testid={`${data.id}-tab`}>
          {data.label}
        </button>
      {/each}
    </div>

    {#each tabsData as data}
      <div {...api.getContentProps({ value: data.id })} class={styles.Content} data-testid={`${data.id}-tab-panel`}>
        <p>{data.content}</p>
        {#if data.id === "agnes"}
          <input placeholder="Agnes" />
        {/if}
      </div>
    {/each}
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
