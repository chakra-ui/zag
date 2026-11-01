<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import { useListVirtualizer } from "#lib/use-virtualizer.svelte.ts"
  import * as select from "@zag-js/select"
  import { selectData } from "@zag-js/shared"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import { ChevronsUpDownIcon } from "lucide-svelte"
  import "@styles/select.css"

  const estimateSize = () => 32

  const collection = select.collection({
    items: selectData,
    itemToString: (item) => item.label,
    itemToValue: (item) => item.value,
  })

  const { virtualizer, init } = useListVirtualizer({
    count: selectData.length,
    estimatedSize: estimateSize,
    observeScrollElementSize: true,
  })

  const id = $props.id()
  const service = useMachine(select.machine, {
    id,
    collection,
    scrollToIndexFn(details) {
      virtualizer.scrollToIndex(details.index, { align: "center" })
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
          <div {...api.getListProps()} {@attach init} onscroll={virtualizer.handleScroll}>
            <div style:height="{virtualizer.getTotalSize()}px" style:width="100%" style:position="relative">
              {#each virtualizer.getVirtualItems() as vi (selectData[vi.index].value)}
                {@const item = selectData[vi.index]}
                <div {...mergeProps(api.getItemProps({ item }), { style: virtualizer.getItemStyle(vi) })}>
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
