<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import * as select from "@zag-js/select"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { ChevronsUpDownIcon } from "lucide-svelte"

  interface Item {
    label: string
    value: string
  }

  interface Props {
    items: Item[]
    label: string
    defaultValue?: string | undefined
  }

  const { items, label, defaultValue }: Props = $props()

  const id = $props.id()
  const service = useMachine(select.machine as select.Machine<Item>, () => ({
    collection: select.collection({ items }),
    id,
    defaultValue: defaultValue ? [defaultValue] : undefined,
    alignItemWithTrigger: true,
  }))

  const api = $derived(select.connect(service, normalizeProps))
</script>

<div {...api.getRootProps()}>
  <!-- svelte-ignore a11y_label_has_associated_control -->
  <label {...api.getLabelProps()}>{label}</label>
  <div {...api.getControlProps()}>
    <button {...api.getTriggerProps()}>
      <span {...api.getValueTextProps()}>{api.valueAsString || "Select a fruit"}</span>
      <span {...api.getIndicatorProps()}>
        <ChevronsUpDownIcon />
      </span>
    </button>
  </div>

  {#if api.open}
    <Portal>
      <div {...api.getPositionerProps()}>
        <div {...api.getContentProps()}>
          <div {...api.getScrollArrowProps({ placement: "top" })}>▲</div>
          <div {...api.getListProps()}>
            {#each items as item (item.value)}
              <div {...api.getItemProps({ item })}>
                <span {...api.getItemTextProps({ item })}>{item.label}</span>
                <span {...api.getItemIndicatorProps({ item })}>✓</span>
              </div>
            {/each}
          </div>
          <div {...api.getScrollArrowProps({ placement: "bottom" })}>▼</div>
        </div>
      </div>
    </Portal>
  {/if}
</div>
