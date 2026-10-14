<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as combobox from "@zag-js/combobox"
  import { createFilter } from "@zag-js/i18n-utils"
  import { comboboxControls, comboboxData } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { XIcon } from "lucide-svelte"
  import "@styles/combobox.css"

  interface Item {
    code: string
    label: string
  }

  const { contains } = createFilter({ sensitivity: "base" })

  const controls = useControls(comboboxControls)

  let options = $state.raw(comboboxData)
  let submitCount = $state(0)
  let lastSubmit = $state<string | null>(null)

  const collection = $derived(
    combobox.collection<Item>({
      items: options,
      itemToValue: (item) => item.code,
      itemToString: (item) => item.label,
    }),
  )

  const id = $props.id()
  const service = useMachine(
    combobox.machine as combobox.Machine<Item>,
    controls.mergeProps<combobox.Props<Item>>(() => ({
      id,
      collection,
      name: "country",
      onOpenChange() {
        options = comboboxData
      },
      onInputValueChange({ inputValue }) {
        const filtered = comboboxData.filter((item) => contains(item.label, inputValue))
        options = filtered
      },
    })),
  )

  const api = $derived(combobox.connect(service, normalizeProps))
</script>

<main class="combobox">
  <form
    onsubmit={(e) => {
      e.preventDefault()
      const data = new FormData(e.currentTarget)
      const value = String(data.get("country") ?? "")
      submitCount++
      lastSubmit = value
    }}
  >
    <div {...api.getRootProps()}>
      <!-- svelte-ignore a11y_label_has_associated_control -->
      <label {...api.getLabelProps()}>Select country</label>
      <div {...api.getControlProps()}>
        <input data-testid="input" {...api.getInputProps()} />
        <button data-testid="trigger" type="button" {...api.getTriggerProps()}>▼</button>
        <button type="button" {...api.getClearTriggerProps()}>
          <XIcon />
        </button>
      </div>
    </div>
    <div {...api.getPositionerProps()}>
      {#if options.length > 0}
        <ul data-testid="combobox-content" {...api.getContentProps()}>
          {#each options as item (item.code)}
            <li data-testid={item.code} {...api.getItemProps({ item })}>
              <span {...api.getItemIndicatorProps({ item })}>✅</span>
              <span>{item.label}</span>
            </li>
          {/each}
        </ul>
      {/if}
    </div>

    <div style="margin-top: 16px">
      <button type="submit">Submit</button>
    </div>
  </form>

  <section style="margin-top: 16px">
    <strong>submit count:</strong> <span data-testid="submit-count">{submitCount}</span>
    <br />
    <strong>last submitted value:</strong> <span data-testid="last-submit">{lastSubmit ?? "—"}</span>
  </section>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
