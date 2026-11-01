<script lang="ts">
  import * as rating from "@zag-js/rating-group"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import { Star } from "./rating-icons.svelte"

  interface Props {
    label: string
    size: string
  }

  const props: Props = $props()

  const id = $props.id()
  const service = useMachine(rating.machine, {
    id,
    defaultValue: 3,
  })

  const api = $derived(rating.connect(service, normalizeProps))
</script>

<div {...mergeProps(api.getRootProps(), { style: { "--rating-size": props.size } })}>
  <!-- svelte-ignore a11y_label_has_associated_control -->
  <label {...api.getLabelProps()}>{props.label}</label>
  <div {...api.getControlProps()}>
    {#each api.items as index (index)}
      <span {...api.getItemProps({ index })}>
        {@render Star()}
      </span>
    {/each}
  </div>
  <input {...api.getHiddenInputProps()} />
</div>
