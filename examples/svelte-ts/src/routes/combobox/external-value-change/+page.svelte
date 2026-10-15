<script lang="ts">
  import Output from "$lib/components/output.svelte"
  import * as combobox from "@zag-js/combobox"
  import { createFilter } from "@zag-js/i18n-utils"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-svelte"
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
    { label: "Qwik", value: "qwik" },
    { label: "Lit", value: "lit" },
    { label: "Alpine.js", value: "alpinejs" },
    { label: "Ember", value: "ember" },
    { label: "Next.js", value: "nextjs" },
  ]

  const { contains } = createFilter({ sensitivity: "base" })

  let value = $state<string[]>(["react"])
  let options = $state(frameworks)

  const collection = $derived(
    combobox.collection({
      items: options,
      itemToValue: (item) => item.value,
      itemToString: (item) => item.label,
    }),
  )

  const id = $props.id()
  const service = useMachine(combobox.machine as combobox.Machine<Item>, (): combobox.Props<Item> => ({
    id,
    collection,
    value,
    onValueChange: (details) => {
      value = details.value
    },
    // Reset on close so reopening shows every option, not the last filtered list
    onOpenChange: ({ open }) => {
      if (!open) options = frameworks
    },
    onInputValueChange: ({ inputValue, reason }) => {
      // Selection and external values also set the input; only typing should filter
      if (reason !== "input-change") {
        options = frameworks
        return
      }
      options = frameworks.filter((item) => contains(item.label, inputValue))
    },
    placeholder: "Type to search",
  }))

  const api = $derived(combobox.connect(service, normalizeProps))

  // The selected item may be filtered out, so the external value must still resolve
  function setExternalValue(next: string[]) {
    options = frameworks
    value = next
  }
</script>

<main class="combobox">
  <div class="vstack gap-6">
    <div class="hstack">
      <button data-testid="set-solid-button" onclick={() => setExternalValue(["solid"])}>Set to Solid</button>
      <button onclick={() => setExternalValue(["svelte"])}>Set to Svelte</button>
      <button onclick={() => setExternalValue([])}>Clear</button>
    </div>

    <div class="hstack gap-4 items-start">
      <Output label="value" {value} />
      <Output label="inputValue" value={api.inputValue} />
    </div>

    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>Framework</label>
      <div {...api.getControlProps()}>
        <input data-testid="input" {...api.getInputProps()} />
        <button {...api.getClearTriggerProps()}>
          <XIcon />
        </button>
        <button data-testid="trigger" {...api.getTriggerProps()}>
          <ChevronsUpDownIcon />
        </button>
      </div>
    </div>

    <div {...api.getPositionerProps()}>
      <div data-testid="combobox-content" {...api.getContentProps()}>
        <div {...api.getEmptyProps()}>
          {#if options.length === 0}No frameworks found{/if}
        </div>
        {#if options.length > 0}
          <div {...api.getListProps()}>
            {#each options as item (item.value)}
              <div data-testid={item.value} {...api.getItemProps({ item })}>
                <span {...api.getItemTextProps({ item })}>{item.label}</span>
                <span {...api.getItemIndicatorProps({ item })}>
                  <CheckIcon />
                </span>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>
</main>
