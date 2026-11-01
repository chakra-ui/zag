<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import * as select from "@zag-js/select"
  import { selectData } from "@zag-js/shared"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import { ChevronsUpDownIcon, XIcon } from "lucide-svelte"

  const id = $props.id()
  const service = useMachine(select.machine, {
    collection: select.collection({ items: selectData }),
    id,
    name: "country",
  })

  const api = $derived(select.connect(service, normalizeProps))
</script>

<div {...api.getRootProps()}>
  <!-- svelte-ignore a11y_label_has_associated_control -->
  <label {...api.getLabelProps()}>Label</label>
  <div {...api.getControlProps()}>
    <button
      {...mergeProps(api.getTriggerProps(), {
        "aria-controls": !api.open ? (null as unknown as undefined) : undefined,
      })}
    >
      <span>{api.valueAsString || "Select option"}</span>
    </button>
    <div class="select-indicator-group">
      <button {...api.getClearTriggerProps()}>
        <XIcon />
      </button>
      <span {...api.getIndicatorProps()}>
        <ChevronsUpDownIcon />
      </span>
    </div>
  </div>
  {#if api.open}
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
  {/if}
</div>
