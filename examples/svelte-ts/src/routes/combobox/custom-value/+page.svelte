<script lang="ts">
  import * as combobox from "@zag-js/combobox"
  import { createFilter } from "@zag-js/i18n-utils"
  import { comboboxData } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { XIcon } from "lucide-svelte"
  import "@styles/combobox.css"

  interface Item {
    code: string
    label: string
  }

  let options = $state.raw(comboboxData)

  const collection = $derived(
    combobox.collection({
      items: options,
      itemToValue: (item) => item.code,
      itemToString: (item) => item.label,
    }),
  )

  const { contains } = createFilter({ sensitivity: "base" })

  const id = $props.id()
  const service = useMachine(combobox.machine as combobox.Machine<Item>, () => ({
    id,
    collection,
    name: "country",
    onInputValueChange({ inputValue }) {
      const filtered = comboboxData.filter((item) => contains(item.label, inputValue))
      options = filtered
    },
    allowCustomValue: true,
  }))

  const api = $derived(combobox.connect(service, normalizeProps))
</script>

<main class="combobox">
  <form
    onsubmit={(e) => {
      e.preventDefault()
      const data = new FormData(e.currentTarget)
      console.log(data.get("country"))
    }}
  >
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
        {#if options.length > 0}
          <div {...api.getListProps()}>
            {#each options as item (item.code)}
              <div data-testid={item.code} {...api.getItemProps({ item })}>
                <span {...api.getItemIndicatorProps({ item })}>✅</span>
                <span>{item.label}</span>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </form>
</main>
