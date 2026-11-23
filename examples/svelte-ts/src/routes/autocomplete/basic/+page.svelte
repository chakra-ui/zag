<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import { useControls } from "#lib/use-controls.svelte.ts"
  import * as autocomplete from "@zag-js/autocomplete"
  import { createFilter } from "@zag-js/utils/search"
  import { autocompleteControls, comboboxData } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { XIcon } from "lucide-svelte"
  import "@styles/autocomplete.css"

  interface Item {
    code: string
    label: string
  }

  const { contains } = createFilter({ sensitivity: "base" })

  const controls = useControls(autocompleteControls)

  let value = $state("")
  let submitted = $state<string | null>(null)

  // `list` and `both` show suggestions that match the text
  const items = $derived(
    controls.context.mode === "list" || controls.context.mode === "both"
      ? comboboxData.filter((item) => contains(item.label, value))
      : comboboxData,
  )

  const collection = $derived(
    autocomplete.collection<Item>({
      items,
      itemToValue: (item) => item.code,
      itemToString: (item) => item.label,
    }),
  )

  const id = $props.id()
  const service = useMachine(
    autocomplete.machine as autocomplete.Machine<Item>,
    controls.mergeProps<autocomplete.Props<Item>>(() => ({
      id,
      collection,
      name: "country",
      placeholder: "Search countries",
      value,
      onValueChange: (details) => {
        value = details.value
      },
    })),
  )

  const api = $derived(autocomplete.connect(service, normalizeProps))
</script>

<main class="autocomplete">
  <form
    class="autocomplete-form"
    onsubmit={(event) => {
      event.preventDefault()
      submitted = String(new FormData(event.currentTarget).get("country"))
    }}
  >
    <div {...api.getRootProps()}>
      <!-- svelte-ignore a11y_label_has_associated_control -->
      <label {...api.getLabelProps()}>Country</label>
      <div {...api.getControlProps()}>
        <input {...api.getInputProps()} />
        <button {...api.getClearTriggerProps()}>
          <XIcon />
        </button>
        <button {...api.getTriggerProps()}>▼</button>
      </div>
    </div>
    <button type="submit">Submit</button>
  </form>

  <pre data-testid="output">value: {JSON.stringify(api.value)}
submitted: {submitted == null ? "—" : JSON.stringify(submitted)}</pre>

  <div {...api.getPositionerProps()}>
    <div {...api.getContentProps()}>
      <div {...api.getEmptyProps()}>No countries match</div>
      <ul {...api.getListProps()}>
        {#each items as item (item.code)}
          <li {...api.getItemProps({ item })}>
            <span {...api.getItemTextProps({ item })}>{item.label}</span>
          </li>
        {/each}
      </ul>
    </div>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
