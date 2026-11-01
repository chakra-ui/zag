<script lang="ts">
  import * as combobox from "@zag-js/combobox"
  import { contains } from "@zag-js/dom-query"
  import { createFilter } from "@zag-js/i18n-utils"
  import { comboboxData } from "@zag-js/shared"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import * as tagsInput from "@zag-js/tags-input"
  import "@styles/combobox.css"
  import "@styles/tags-input.css"

  const { contains: matchContains } = createFilter({ sensitivity: "base" })

  // id composition for tags input and combobox
  const id = $props.id()
  const ids = {
    root: `${id}-root`,
    input: `${id}-input`,
    control: `${id}-control`,
  }

  let contentRef = $state<HTMLDivElement | null>(null)

  let options = $state.raw(comboboxData)
  let value = $state.raw<string[]>([])

  const collection = $derived(
    combobox.collection({
      items: options,
      itemToValue: (item) => item.code,
      itemToString: (item) => item.label,
    }),
  )

  const service = useMachine(combobox.machine, () => ({
    id: `${id}-combobox`,
    collection,
    ids,
    allowCustomValue: true,
    multiple: true,
    selectionBehavior: "clear" as const,
    value,
    onOpenChange() {
      options = comboboxData.filter((item) => !value.includes(item.code))
    },
    onInputValueChange({ inputValue }) {
      const result = comboboxData.filter((item) => matchContains(item.label, inputValue))
      options = result
    },
    onValueChange(details) {
      // sync tags input value and options
      queueMicrotask(() => {
        value = details.value
        options = options.filter((item) => !details.value.includes(item.code))
        contentRef?.scrollTo(0, 0)
      })
    },
  }))

  const comboboxApi = $derived(combobox.connect(service, normalizeProps))

  const tagService = useMachine(tagsInput.machine, () => ({
    id: `${id}-tags`,
    ids,
    editable: false,
    addOnPaste: false,
    onInteractOutside(event) {
      const { target } = event.detail.originalEvent
      if (contains(contentRef, target)) {
        event.preventDefault()
      }
    },
    inputValue: comboboxApi.inputValue,
    value,
    onValueChange(details) {
      value = details.value
    },
    onInputValueChange({ inputValue }) {
      comboboxApi.setInputValue(inputValue)
    },
  }))

  const tagApi = $derived(tagsInput.connect(tagService, normalizeProps))
</script>

<main class="combobox">
  <div {...mergeProps(comboboxApi.getRootProps(), tagApi.getRootProps())}>
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label {...comboboxApi.getLabelProps()}>Select country</label>

    <div {...mergeProps(comboboxApi.getControlProps(), tagApi.getControlProps())}>
      {#each tagApi.value as value, index (value)}
        <span {...tagApi.getItemProps({ index, value })}>
          <div {...tagApi.getItemPreviewProps({ index, value })}>
            <span {...tagApi.getItemTextProps({ index, value })}>{value} </span>
            <button {...tagApi.getItemDeleteTriggerProps({ index, value })}>&#x2715;</button>
          </div>
          <input {...tagApi.getItemInputProps({ index, value })} />
        </span>
      {/each}

      <input
        data-testid="input"
        placeholder="add tag"
        {...mergeProps(comboboxApi.getInputProps(), tagApi.getInputProps(), {
          onkeydown(event: KeyboardEvent) {
            // extra logic to add tag on Enter key
            if (event.key === "Enter" && options.length === 0) {
              tagApi.addValue(comboboxApi.inputValue)
            }
          },
        })}
      />
    </div>
  </div>

  <div {...comboboxApi.getPositionerProps()}>
    <div data-testid="combobox-content" {...comboboxApi.getContentProps()}>
      {#if options.length > 0}
        <div {...comboboxApi.getListProps()} bind:this={contentRef}>
          {#each options as item (item.code)}
            <div data-testid={item.code} {...comboboxApi.getItemProps({ item })}>
              {item.label}
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</main>
