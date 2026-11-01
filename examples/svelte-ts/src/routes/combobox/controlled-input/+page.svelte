<script lang="ts">
  import * as combobox from "@zag-js/combobox"
  import { createFilter } from "@zag-js/i18n-utils"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/combobox.css"

  interface Item {
    label: string
    value: string
  }

  const frameworks: Item[] = [
    { label: "React", value: "react" },
    { label: "Solid", value: "solid" },
    { label: "Vue", value: "vue" },
    { label: "Angular", value: "angular" },
    { label: "Svelte", value: "svelte" },
    { label: "Preact", value: "preact" },
  ]

  const { contains } = createFilter({ sensitivity: "base" })

  let value = $state<string[]>([])
  let inputValue = $state("")
  let options = $state.raw(frameworks)

  const collection = $derived(
    combobox.collection({
      items: options,
      itemToValue: (item) => item.value,
      itemToString: (item) => item.label,
    }),
  )

  const id = $props.id()
  const service = useMachine(combobox.machine as combobox.Machine<Item>, () => ({
    id,
    collection,
    value,
    inputValue,
    onValueChange: (e) => {
      value = e.value
      if (e.value.length > 0) {
        const item = frameworks.find((f) => f.value === e.value[0])
        if (item) inputValue = item.label
      }
    },
    onInputValueChange: ({ inputValue: v }) => {
      inputValue = v
      options = frameworks.filter((item) => contains(item.label, v))
    },
    onOpenChange: (e) => {
      if (e.reason === "trigger-click") {
        options = frameworks
      }
    },
    placeholder: "Type to search",
  }))

  const api = $derived(combobox.connect(service, normalizeProps))
</script>

<main class="combobox" style="padding: 2rem">
  <div style="display: flex; flex-direction: column; gap: 1rem; max-width: 320px">
    <div style="font-size: 0.875rem">
      <strong>Value:</strong>
      {value.length > 0 ? value.join(", ") : "—"}
    </div>
    <div style="font-size: 0.875rem">
      <strong>Input (controlled):</strong>
      {inputValue || "—"}
    </div>

    <div>
      <!-- svelte-ignore a11y_label_has_associated_control -->
      <label {...api.getLabelProps()}>Select framework</label>
      <div {...mergeProps(api.getControlProps(), { style: "display: flex; margin-top: 4px" })}>
        <input
          data-testid="input"
          {...mergeProps(api.getInputProps(), {
            style: "flex: 1; padding: 8px 12px; border: 1px solid #ccc; border-radius: 4px",
          })}
        />
        <button data-testid="trigger" {...mergeProps(api.getTriggerProps(), { style: "padding: 8px" })}>▼</button>
      </div>
    </div>

    <div {...api.getPositionerProps()}>
      <div
        data-testid="combobox-content"
        {...mergeProps(api.getContentProps(), {
          style:
            "list-style: none; margin: 0; padding: 4px; border: 1px solid #ccc; border-radius: 4px; margin-top: 4px; max-height: 200px; overflow: auto",
        })}
      >
        <div {...api.getListProps()}>
          {#each options as item (item.value)}
            <div
              data-testid={item.value}
              {...mergeProps(api.getItemProps({ item }), { style: "padding: 8px 12px; cursor: pointer" })}
            >
              {item.label}
            </div>
          {/each}
        </div>
      </div>
    </div>

    <button
      data-testid="set-search-button"
      onclick={() => (inputValue = "vue")}
      style="padding: 8px 16px; background-color: #3182ce; color: white; border: none; border-radius: 4px; cursor: pointer"
    >
      Set input to &quot;vue&quot; externally
    </button>
  </div>
</main>
