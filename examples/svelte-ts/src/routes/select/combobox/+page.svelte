<script lang="ts">
  import Portal from "$lib/components/portal.svelte"
  import * as combobox from "@zag-js/combobox"
  import { createFilter } from "@zag-js/i18n-utils"
  import { selectData } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/select.css"
  import "@styles/combobox.css"

  const { contains } = createFilter({ sensitivity: "base" })

  let options = $state.raw(selectData)

  const collection = $derived(combobox.collection({ items: options }))

  const id = $props.id()
  const service = useMachine(combobox.machine, () => ({
    id,
    collection,
    popupType: "dialog" as const,
    selectionBehavior: "clear" as const,
    inputBehavior: "autohighlight" as const,
    onOpenChange() {
      options = selectData
    },
    onInputValueChange({ inputValue }: combobox.InputValueChangeDetails) {
      const filtered = selectData.filter((item) => contains(item.label, inputValue))
      options = filtered.length > 0 ? filtered : selectData
    },
  }))

  const api = $derived(combobox.connect(service, normalizeProps))
</script>

<main class="select">
  <div {...api.getRootProps()}>
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label {...api.getLabelProps()}>Country</label>
    <div {...api.getControlProps()}>
      <button {...api.getTriggerProps({ focusable: true })}>{api.valueAsString || "Select Country"}</button>
    </div>

    <Portal>
      <div {...api.getPositionerProps()}>
        <div {...api.getContentProps()}>
          <input {...api.getInputProps()} />
          <div {...api.getListProps()}>
            {#each options as item (item.value)}
              <div {...api.getItemProps({ item })}>
                {item.label}
              </div>
            {/each}
          </div>
        </div>
      </div>
    </Portal>
  </div>
</main>
