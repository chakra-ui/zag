<script lang="ts">
  import { HalfStar, Star } from "#lib/components/rating-icons.svelte"
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import { useControls } from "#lib/use-controls.svelte.ts"
  import * as rating from "@zag-js/rating-group"
  import { ratingControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/rating-group.css"

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

<main class="rating">
  <form action="" class="vstack gap-4">
    <div {...api.getRootProps()}>
      <!-- svelte-ignore a11y_label_has_associated_control -->
      <label {...api.getLabelProps()}>Rate:</label>
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
      <input {...api.getHiddenInputProps()} data-testid="hidden-input" />
    </div>
    <button type="reset">Reset</button>
  </form>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
