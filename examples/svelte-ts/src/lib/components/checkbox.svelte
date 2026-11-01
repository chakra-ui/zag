<script lang="ts">
  import * as checkbox from "@zag-js/checkbox"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { CheckIcon, MinusIcon } from "lucide-svelte"
  import type { Snippet } from "svelte"

  interface Props extends Omit<checkbox.Props, "id"> {
    label: string | Snippet
    description?: string | Snippet
    "data-testid"?: string
  }

  const props: Props = $props()

  const machineProps = $derived.by(() => {
    const { label: _label, description: _description, "data-testid": _testId, ...rest } = props
    return rest
  })

  const id = $props.id()
  const service = useMachine(checkbox.machine, () => ({ id, ...machineProps }))
  const api = $derived(checkbox.connect(service, normalizeProps))
</script>

{#snippet content(value: string | Snippet)}
  {#if typeof value === "string"}{value}{:else}{@render value()}{/if}
{/snippet}

<label {...api.getRootProps()}>
  <div {...api.getControlProps()}>
    <span {...api.getIndicatorProps()}>
      {#if api.indeterminate}
        <MinusIcon />
      {:else}
        <CheckIcon />
      {/if}
    </span>
  </div>
  <span {...api.getLabelProps()}>
    {@render content(props.label)}
    {#if props.description}
      <span class="checkbox-description">{@render content(props.description)}</span>
    {/if}
  </span>
  <input {...api.getHiddenInputProps()} data-testid={props["data-testid"]} />
</label>
