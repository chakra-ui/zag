<script lang="ts">
  import * as rating from "@zag-js/rating-group"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { ratingControls } from "@zag-js/shared"
  import { useControls } from "$lib/use-controls.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"

  const controls = useControls(ratingControls)

  const id = $props.id()
  const service = useMachine(
    rating.machine,
    controls.mergeProps<rating.Props>({
      id,
      defaultValue: 2.5,
    }),
  )

  const api = $derived(rating.connect(service, normalizeProps))
</script>

{#snippet HalfStar()}
  <svg viewBox="0 0 273 260" data-part="star">
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M135.977 214.086L52.1294 259.594L69.6031 165.229L0 99.1561L95.1465 86.614L135.977 1.04785V214.086Z"
      fill="currentColor"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M135.977 213.039L219.826 258.546L202.352 164.181L271.957 98.1082L176.808 85.5661L135.977 0V213.039Z"
      fill="#bdbdbd"
    />
  </svg>
{/snippet}

{#snippet Star()}
  <svg viewBox="0 0 273 260" data-part="star">
    <path
      d="M136.5 0L177.83 86.614L272.977 99.1561L203.374 165.229L220.847 259.594L136.5 213.815L52.1528 259.594L69.6265 165.229L0.0233917 99.1561L95.1699 86.614L136.5 0Z"
      fill="currentColor"
    />
  </svg>
{/snippet}

<main class="rating">
  <form action="">
    <div {...api.getRootProps()}>
      <!-- svelte-ignore a11y_label_has_associated_control -->
      <label {...api.getLabelProps()}>Rate:</label>
      <div {...api.getControlProps()}>
        {#each api.items as index}
          {@const itemState = api.getItemState({ index })}
          <span {...api.getItemProps({ index })}>
            {#if itemState.half}
              {@render HalfStar()}
            {:else}
              {@render Star()}
            {/if}
          </span>
        {/each}
      </div>
      <input {...api.getHiddenInputProps()} data-testid="hidden-input" />
    </div>
    <button type="reset">Reset</button>
  </form>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
