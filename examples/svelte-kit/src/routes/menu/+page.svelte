<script lang="ts">
  import * as menu from "@zag-js/menu"
  import { useMachine, attach, normalizeProps } from "@zag-js/svelte"

  import StateVisualizer from "../../components/state-visualizer.svelte"
  import Toolbar from "../../components/toolbar.svelte"

  const [state, send] = useMachine(menu.machine({ id: "accordion" }))

  $: api = menu.connect($state, send, normalizeProps)
</script>

<main>
  <div>
    <button {...api.triggerProps.attrs} use:attach={api.triggerProps.rest}>
      Actions <span aria-hidden>▾</span>
    </button>

    <div {...api.positionerProps.attrs} use:attach={api.positionerProps.rest}>
      <ul {...api.contentProps.attrs} use:attach={api.contentProps.rest}>
        <li 
          {...api.getItemProps({ id: "edit" }).attrs} 
          use:attach={api.getItemProps({ id: "edit" }).rest}
        >
          Edit
        </li>
        <li 
          {...api.getItemProps({ id: "duplicate" }).attrs} 
          use:attach={api.getItemProps({ id: "duplicate" }).rest}
        >
          Duplicate
        </li>
        <li 
          {...api.getItemProps({ id: "delete" }).attrs}
          use:attach={api.getItemProps({ id: "delete" }).rest}
        >
          Delete
        </li>
        <li 
          {...api.getItemProps({ id: "export" }).attrs}
          use:attach={api.getItemProps({ id: "export" }).rest}
        >
          Export...
        </li>
      </ul>
    </div>
  </div>
</main>
<Toolbar>
  <StateVisualizer state={$state} />
</Toolbar>
