<script lang="ts">
  import * as menu from "@zag-js/menu"
  import { normalizeProps, useMachine, zag } from "@zag-js/svelte"

  import StateVisualizer from "../components/state-visualizer.svelte"
  import Toolbar from "../components/toolbar.svelte"

  const [state, send] = useMachine(menu.machine({ id: "accordion" }))

  $: api = menu.connect($state, send, normalizeProps)
</script>

<main>
  <div>
    <button {...api.triggerProps.attributes} use:zag={api.triggerProps.handlers}>
      Actions <span aria-hidden>▾</span>
    </button>

    <div {...api.positionerProps.attributes} use:zag={api.positionerProps.handlers}>
      <ul {...api.contentProps.attributes} use:zag={api.contentProps.handlers}>
        <li {...api.getItemProps({ id: "edit" }).attributes} use:zag={api.getItemProps({ id: "edit" }).handlers}>Edit</li>
        <li {...api.getItemProps({ id: "duplicate" }).attributes} use:zag={api.getItemProps({ id: "duplicate" }).handlers}>Duplicate</li>
        <li {...api.getItemProps({ id: "delete" }).attributes} use:zag={api.getItemProps({ id: "delete" }).handlers}>Delete</li>
        <li {...api.getItemProps({ id: "export" }).attributes} use:zag={api.getItemProps({ id: "export" }).handlers}>Export...</li>
      </ul>
    </div>
  </div>
</main>
<Toolbar>
  <StateVisualizer state={$state} />
</Toolbar>
