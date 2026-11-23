<script lang="ts">
  import { useListVirtualizer } from "#lib/use-virtualizer.svelte.ts"
  import * as combobox from "@zag-js/combobox"
  import { createFilter } from "@zag-js/utils/search"
  import { comboboxData } from "@zag-js/shared"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import { XIcon } from "lucide-svelte"
  import "@styles/combobox.css"

  interface Item {
    code: string
    label: string
  }

  const { contains } = createFilter({ sensitivity: "base" })

  let options = $state.raw(comboboxData)

  const id = $props.id()
  const vz = useListVirtualizer(() => ({
    id,
    count: options.length,
    itemSize: 32,
    observeScrollElementSize: true,
  }))

  const collection = $derived(
    combobox.collection({
      items: options,
      itemToValue: (item) => item.code,
      itemToString: (item) => item.label,
    }),
  )

  const service = useMachine(combobox.machine as combobox.Machine<Item>, () => ({
    id,
    collection,
    scrollToIndexFn(details) {
      vz.virtualizer.scrollToIndex(details.index, { align: details.immediate ? "center" : "auto" })
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
      <div {...mergeProps(vz.virtualizer.getRootProps(), api.getListProps())} {@attach vz.init}>
        <div {...vz.virtualizer.getContentProps()}>
          {#each vz.virtualizer.getVirtualItems() as vi (options[vi.index]?.code ?? vi.index)}
            {@const item = options[vi.index]}
            <!-- The count syncs before paint; skip rows from the previous one -->
            {#if item}
              <div data-testid={item.code} {...mergeProps(vz.virtualizer.getItemProps(vi), api.getItemProps({ item }))}>
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
