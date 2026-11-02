<script lang="ts">
  import { HalfStar, Star } from "#lib/components/rating-icons.svelte"
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import * as rating from "@zag-js/rating-group"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/rating-group.css"

  const id = $props.id()
  const service = useMachine(rating.machine, {
    id,
    readOnly: true,
    allowHalf: true,
    defaultValue: 4.5,
  })

  const api = $derived(rating.connect(service, normalizeProps))
</script>

<main class="rating">
  <div {...api.getRootProps()}>
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label {...api.getLabelProps()}>Average rating</label>
    <div class="hstack">
      <div {...api.getControlProps()}>
        {#each api.items as index (index)}
          {@const state = api.getItemState({ index })}
          <span {...api.getItemProps({ index })}>
            {#if state.half}
              {@render HalfStar()}
            {:else}
              {@render Star()}
            {/if}
          </span>
        {/each}
      </div>
      <span class="rating-summary">
        <strong>{api.value}</strong> · 128 reviews
      </span>
    </div>
    <input {...api.getHiddenInputProps()} />
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} />
</Toolbar>
