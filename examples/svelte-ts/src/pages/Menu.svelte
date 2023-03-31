<script lang="ts">
  import * as menu from "@zag-js/menu"
  import { normalizeProps, useMachine, spreadRest } from "@zag-js/svelte"
  import { writable } from "svelte/store"

  import StateVisualizer from "../components/state-visualizer.svelte"
  import Toolbar from "../components/toolbar.svelte"

  const [state, send] = useMachine(menu.machine({ id: "accordion" }))

  const api = writable(menu.connect($state, send, normalizeProps))

  state.subscribe((next) => {
    // console.log(api.positionerProps.attributes)
    api.set(menu.connect(next, send, normalizeProps))
  })
</script>

<main>
  <div>
    <button {...$api.triggerProps.attributes} use:spreadRest={$api.triggerProps}>
      Actions <span aria-hidden>▾</span>
    </button>

    <div {...$api.positionerProps.attributes} use:spreadRest={$api.positionerProps}>
      <ul {...$api.contentProps.attributes} use:spreadRest={$api.contentProps}>
        <li {...$api.getItemProps({ id: "edit" }).attributes} use:spreadRest={$api.getItemProps({ id: "edit" })}>
          Edit
        </li>
        <li
          {...$api.getItemProps({ id: "duplicate" }).attributes}
          use:spreadRest={$api.getItemProps({ id: "duplicate" })}
        >
          Duplicate
        </li>
        <li {...$api.getItemProps({ id: "delete" }).attributes} use:spreadRest={$api.getItemProps({ id: "delete" })}>
          Delete
        </li>
        <li {...$api.getItemProps({ id: "export" }).attributes} use:spreadRest={$api.getItemProps({ id: "export" })}>
          Export...
        </li>
      </ul>
    </div>
  </div>
</main>
<Toolbar>
  <StateVisualizer state={$state} />
</Toolbar>
