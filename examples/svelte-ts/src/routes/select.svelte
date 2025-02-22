<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as select from "@zag-js/select"
  import { selectControls, selectData } from "@zag-js/shared"
  import { normalizeProps, portal, useMachine } from "@zag-js/svelte"
  import serialize from "form-serialize"

  const controls = useControls(selectControls)

  const service = useMachine(select.machine, {
    id: "1",
    name: "select",
    collection: select.collection({ items: selectData }),
  })

  const api = $derived(select.connect(service, normalizeProps))
</script>

<main class="select">
  <div {...api.getRootProps()}>
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label {...api.getLabelProps()}>Label</label>

    <div {...api.getControlProps()}>
      <button {...api.getTriggerProps()}>
        <span>{api.valueAsString || "Select option"}</span>
        <span {...api.getIndicatorProps()}>▼</span>
      </button>
      <button {...api.getClearTriggerProps()}>X</button>
    </div>

    <form
      onsubmit={(e) => {
        e.preventDefault()
        const formData = serialize(e.currentTarget, { hash: true })
        console.log(formData)
      }}
      onchange={(e) => {
        const formData = serialize(e.currentTarget, { hash: true })
        console.log(formData)
      }}
    >
      <button>Submit</button>
      <select {...api.getHiddenSelectProps()}>
        {#each selectData as option}
          <option value={option.value}>
            {option.label}
          </option>
        {/each}
      </select>
    </form>

    <div use:portal {...api.getPositionerProps()}>
      <ul {...api.getContentProps()}>
        {#each selectData as item}
          <li {...api.getItemProps({ item })}>
            <span {...api.getItemTextProps({ item })}>{item.label}</span>
            <span {...api.getItemIndicatorProps({ item })}>✓</span>
          </li>
        {/each}
      </ul>
    </div>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} omit={["collection"]} />
</Toolbar>
