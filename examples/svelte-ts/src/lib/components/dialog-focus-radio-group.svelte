<script lang="ts">
  import * as radio from "@zag-js/radio-group"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  const { testId }: { testId: string } = $props()

  const id = $props.id()
  const service = useMachine(radio.machine, { id })
  const api = $derived(radio.connect(service, normalizeProps))
</script>

<div {...api.getRootProps()}>
  {#each ["one", "two"] as v (v)}
    <label {...api.getItemProps({ value: v })} data-testid={`${testId}-${v}`} style="display: flex; gap: 8px">
      <div
        {...api.getItemControlProps({ value: v })}
        style="width: 18px; height: 18px; border: 2px solid #888; border-radius: 9px"
      ></div>
      <span {...api.getItemTextProps({ value: v })}>Radio {v}</span>
      <input {...api.getItemHiddenInputProps({ value: v })} />
    </label>
  {/each}
</div>
