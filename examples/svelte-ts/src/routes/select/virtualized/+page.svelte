<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import { useListVirtualizer } from "#lib/use-virtualizer.svelte.ts"
  import * as select from "@zag-js/select"
  import { selectData } from "@zag-js/shared"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import { ChevronsUpDownIcon } from "lucide-svelte"
  import "@styles/select.css"

  const collection = select.collection({
    items: selectData,
    itemToString: (item) => item.label,
    itemToValue: (item) => item.value,
  })

  const id = $props.id()
  const vz = useListVirtualizer({
    id,
    count: selectData.length,
    itemSize: 32,
    observeScrollElementSize: true,
  })

  const service = useMachine(select.machine, {
    id,
    collection,
    scrollToIndexFn(details) {
      vz.virtualizer.scrollToIndex(details.index, { align: details.immediate ? "center" : "auto" })
    },
  })

  const api = $derived(select.connect(service, normalizeProps))
</script>

<main class="select">
  <div {...api.getRootProps()}>
    <div {...api.getControlProps()}>
      <!-- svelte-ignore a11y_label_has_associated_control -->
      <label {...api.getLabelProps()}>Label</label>
      <button {...api.getTriggerProps()}>
        <span>{api.valueAsString || "Select a country"}</span>
        <span {...api.getIndicatorProps()}>
          <ChevronsUpDownIcon />
        </span>
      </button>
    </div>

    <Portal>
      <div {...api.getPositionerProps()}>
        <div {...api.getContentProps()}>
          <div {...mergeProps(vz.virtualizer.getRootProps(), api.getListProps())} {@attach vz.init}>
            <div {...vz.virtualizer.getContentProps()}>
              {#each vz.virtualizer.getVirtualItems() as vi (selectData[vi.index].value)}
                {@const item = selectData[vi.index]}
                <div {...mergeProps(vz.virtualizer.getItemProps(vi), api.getItemProps({ item }))}>
                  <span {...api.getItemTextProps({ item })}>{item.label}</span>
                  <span {...api.getItemIndicatorProps({ item })}>✓</span>
                </div>
              {/each}
            </div>
          </div>
        </div>
      </div>
    </Portal>
  </div>
</main>
