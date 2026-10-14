<script lang="ts">
  import { useListVirtualizer } from "$lib/use-virtualizer.svelte"
  import * as combobox from "@zag-js/combobox"
  import { createFilter } from "@zag-js/i18n-utils"
  import { comboboxData } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { XIcon } from "lucide-svelte"
  import "@styles/combobox.css"

  const estimateSize = () => 32

  interface Item {
    code: string
    label: string
  }

  const { contains } = createFilter({ sensitivity: "base" })

  let options = $state.raw(comboboxData)

  const { virtualizer, init } = useListVirtualizer(() => ({
    count: options.length,
    estimatedSize: estimateSize,
    observeScrollElementSize: true,
  }))

  const collection = $derived(
    combobox.collection({
      items: options,
      itemToValue: (item) => item.code,
      itemToString: (item) => item.label,
    }),
  )

  const id = $props.id()
  const service = useMachine(combobox.machine as combobox.Machine<Item>, () => ({
    id,
    collection,
    scrollToIndexFn(details) {
      virtualizer.scrollToIndex(details.index, { align: "center" })
    },
    onOpenChange() {
      options = comboboxData
    },
    onInputValueChange({ inputValue }) {
      const filtered = comboboxData.filter((item) => contains(item.label, inputValue))
      options = filtered.length > 0 ? filtered : comboboxData
    },
  }))

  const api = $derived(combobox.connect(service, normalizeProps))
</script>

<main class="combobox">
  <div {...api.getRootProps()}>
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label {...api.getLabelProps()}>Select country</label>
    <div {...api.getControlProps()}>
      <input data-testid="input" {...api.getInputProps()} />
      <button data-testid="trigger" {...api.getTriggerProps()}>▼</button>
      <button {...api.getClearTriggerProps()}>
        <XIcon />
      </button>
    </div>
  </div>

  <div {...api.getPositionerProps()}>
    <div data-testid="combobox-content" {...api.getContentProps()}>
      <div {...api.getListProps()} {@attach init} onscroll={virtualizer.handleScroll}>
        <div style="height: {virtualizer.getTotalSize()}px; width: 100%; position: relative">
          {#each virtualizer.getVirtualItems() as vi (options[vi.index]?.code ?? vi.index)}
            {@const item = options[vi.index]}
            <!-- The count syncs before paint; skip rows from the previous one -->
            {#if item}
              <div
                data-testid={item.code}
                {...api.getItemProps({ item })}
                {...normalizeProps.element({
                  style: {
                    ...virtualizer.getItemStyle(vi),
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  },
                })}
              >
                <span>{item.label}</span>
                <span {...api.getItemIndicatorProps({ item })}>✅</span>
              </div>
            {/if}
          {/each}
        </div>
      </div>
    </div>
  </div>
</main>
