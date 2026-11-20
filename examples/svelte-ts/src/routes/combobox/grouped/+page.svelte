<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import { useControls } from "#lib/use-controls.svelte.ts"
  import * as combobox from "@zag-js/combobox"
  import { createFilter } from "@zag-js/i18n-utils"
  import { comboboxControls, groupedData } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { XIcon } from "lucide-svelte"
  import "@styles/combobox.css"

  type Item = (typeof groupedData)[number]

  const { contains } = createFilter({ sensitivity: "base" })

  const controls = useControls(comboboxControls)

  let options = $state.raw(groupedData)
  const collection = $derived(combobox.collection({ items: options, groupBy: (item) => item.type }))

  const id = $props.id()
  const service = useMachine(
    combobox.machine as combobox.Machine<Item>,
    controls.mergeProps<combobox.Props<Item>>(() => ({
      id,
      collection,
      onOpenChange({ open }) {
        if (!open) options = groupedData
      },
      onInputValueChange({ inputValue }) {
        const filtered = groupedData.filter((item) => contains(item.label, inputValue))
        options = filtered.length > 0 ? filtered : groupedData
      },
    })),
  )

  const api = $derived(combobox.connect(service, normalizeProps))
</script>

<main class="combobox">
  <div {...api.getRootProps()}>
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label {...api.getLabelProps()}>Select produce</label>
    <div {...api.getControlProps()}>
      <input data-testid="input" {...api.getInputProps()} />
      <button data-testid="trigger" {...api.getTriggerProps()}>▼</button>
      <button {...api.getClearTriggerProps()}>
        <XIcon />
      </button>
    </div>
  </div>
  <div {...api.getPositionerProps()}>
    {#if options.length > 0}
      <div {...api.getContentProps()}>
        <div {...api.getListProps()}>
          {#each collection.group() as [type, items] (type)}
            <div {...api.getItemGroupProps({ id: type })}>
              <div {...api.getItemGroupLabelProps({ htmlFor: type })}>{type}</div>
              {#each items as item (item.value)}
                <div {...api.getItemProps({ item })}>
                  <span {...api.getItemTextProps({ item })}>{item.label}</span>
                  <span {...api.getItemIndicatorProps({ item })}>✓</span>
                </div>
              {/each}
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
