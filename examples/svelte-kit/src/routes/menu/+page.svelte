<script lang="ts">
  import * as menu from "@zag-js/menu"
  import { useMachine, events, normalizeProps } from "@zag-js/svelte"
  import { ControlsUI, useControls } from "../../stores/controls"
  import { menuControls } from "../../../../../shared/src/controls"

  import StateVisualizer from "../../components/state-visualizer.svelte"
  import Toolbar from "../../components/toolbar.svelte"

  const [context, defaultValues] = useControls(menuControls)
  $: $context = defaultValues

  const [state, send] = useMachine(menu.machine({ id: "accordion" }), { context })

  $: api = menu.connect($state, send, normalizeProps)
</script>

<main>
  <div>
    <button {...api.triggerProps.attrs} use:events={api.triggerProps.handlers}>
      Actions <span aria-hidden>▾</span>
    </button>

    <div {...api.positionerProps.attrs} use:events={api.positionerProps.handlers}>
      <ul {...api.contentProps.attrs} use:events={api.contentProps.handlers}>
        <li {...api.getItemProps({ id: "edit" }).attrs} use:events={api.getItemProps({ id: "edit" }).handlers}>Edit</li>
        <li
          {...api.getItemProps({ id: "duplicate" }).attrs}
          use:events={api.getItemProps({ id: "duplicate" }).handlers}
        >
          Duplicate
        </li>
        <li {...api.getItemProps({ id: "delete" }).attrs} use:events={api.getItemProps({ id: "delete" }).handlers}>
          Delete
        </li>
        <li {...api.getItemProps({ id: "export" }).attrs} use:events={api.getItemProps({ id: "export" }).handlers}>
          Export...
        </li>
      </ul>
    </div>
  </div>
</main>
<Toolbar>
  <ControlsUI slot="controls" {context} controls={menuControls} />
  <StateVisualizer state={$state} />
</Toolbar>
