<script lang="ts">
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { tabsControls, tabsData } from "@zag-js/shared"
  import * as tabs from "@zag-js/tabs"
  import { useControls } from "$lib/use-controls.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"

  const controls = useControls(tabsControls)

  const [_state, send] = useMachine(
    tabs.machine({
      id: "1",
      value: "nils",
    }),
    {
      context: controls.context,
    },
  )

  const api = $derived(tabs.connect(_state, send, normalizeProps))
</script>

<main class="tabs">
  <div {...api.rootProps}>
    <div {...api.indicatorProps} />
    <div {...api.listProps}>
      {#each tabsData as data}
        <button {...api.getTriggerProps({ value: data.id })} data-testid={`${data.id}-tab`}>
          {data.label}
        </button>
      {/each}
    </div>

    {#each tabsData as data}
      <div {...api.getContentProps({ value: data.id })} data-testid={`${data.id}-tab-panel`}>
        <p>{data.content}</p>
        {#if data.id === "agnes"}
          <input placeholder="Agnes" />
        {/if}
      </div>
    {/each}
  </div>
</main>

<Toolbar {controls} state={_state} />
