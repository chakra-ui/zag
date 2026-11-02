<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import * as select from "@zag-js/select"
  import { selectData } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { ChevronsUpDownIcon } from "lucide-svelte"

  const props: { id: string } = $props()

  let open = $state(false)

  const service = useMachine(select.machine, () => ({
    collection: select.collection({ items: selectData }),
    id: props.id,
    name: "country",
    open,
    onOpenChange: (details: select.OpenChangeDetails) => {
      open = details.open
    },
  }))

  const api = $derived(select.connect(service, normalizeProps))
</script>

<div {...api.getRootProps()}>
  <div {...api.getControlProps()}>
    <button {...api.getTriggerProps()}>
      <span>{api.valueAsString || "Select option"}</span>
      <span {...api.getIndicatorProps()}>
        <ChevronsUpDownIcon />
      </span>
    </button>
  </div>
  <Portal>
    <div {...api.getPositionerProps()}>
      <div {...api.getContentProps()}>
        <div {...api.getListProps()}>
          {#each selectData as item (item.value)}
            <div {...api.getItemProps({ item })}>
              <span {...api.getItemTextProps({ item })}>{item.label}</span>
              <span {...api.getItemIndicatorProps({ item })}>✓</span>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </Portal>
</div>
