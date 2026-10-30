<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import { useControls } from "#lib/use-controls.svelte.ts"
  import * as select from "@zag-js/select"
  import { selectControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { ChevronsUpDownIcon, XIcon } from "lucide-svelte"
  import "@styles/select.css"

  const controls = useControls(selectControls)

  let items = $state<{ name: string; url: string }[]>([])

  $effect(() => {
    async function load() {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon`)
      const json = await res.json()
      items = json.results
    }

    load()
  })

  const collection = $derived(
    select.collection({
      items,
      itemToString(item) {
        return item.name
      },
      itemToValue(item) {
        return item.name
      },
    }),
  )

  const id = $props.id()
  const service = useMachine(select.machine, () => ({
    id,
    collection,
  }))

  const api = $derived(select.connect(service, normalizeProps))
</script>

<main class="select">
  <div {...api.getRootProps()}>
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label {...api.getLabelProps()}>Label</label>
    <div {...api.getControlProps()}>
      <button {...api.getTriggerProps()}>
        <span>{api.hasSelectedItems ? api.valueAsString : "Select option"}</span>
      </button>
      <div class="select-indicator-group">
        <button {...api.getClearTriggerProps()}>
          <XIcon />
        </button>
        <span {...api.getIndicatorProps()}>
          <ChevronsUpDownIcon />
        </span>
      </div>
    </div>

    <Portal>
      <div {...api.getPositionerProps()}>
        <div {...api.getContentProps()}>
          <div {...api.getListProps()}>
            {#each items as item (item.name)}
              <div {...api.getItemProps({ item })}>
                <span {...api.getItemTextProps({ item })}>{item.name}</span>
                <span {...api.getItemIndicatorProps({ item })}>✓</span>
              </div>
            {/each}
          </div>
        </div>
      </div>
    </Portal>
  </div>
</main>

<Toolbar {controls} viz>
  <StateVisualizer state={service} />
</Toolbar>
