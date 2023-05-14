<script lang="ts">
  import * as checkbox from "@zag-js/checkbox"
  import { events, normalizeProps, useMachine } from "@zag-js/svelte"
  import { checkboxControls } from "@zag-js/shared"
  import StateVisualizer from "../../components/state-visualizer.svelte"
  import Toolbar from "../../components/toolbar.svelte"
  import { ControlsUI, useControls } from "../../stores/controls"

  const [context, defaultValues] = useControls(checkboxControls)
  $: $context = defaultValues

  const [state, send] = useMachine(checkbox.machine({ id: "checkbox", name: "checkbox" }), { context })

  $: api = checkbox.connect($state, send, normalizeProps)
</script>

<main class="checkbox">
  <form>
    <fieldset>
      <label {...api.rootProps.attrs} use:events={api.rootProps.handlers}>
        <div {...api.controlProps.attrs} use:events={api.controlProps.handlers} />
        <span {...api.labelProps.attrs} use:events={api.labelProps.handlers}
          >Input {api.isChecked ? "Checked" : "Unchecked"}</span
        >
        <input {...api.inputProps.attrs} use:events={api.inputProps.handlers} />
      </label>

      <button
        type="button"
        id="check-id"
        disabled={api.isChecked}
        on:click={() => {
          console.log("in")
          api.setChecked(true)
        }}
      >
        Check
      </button>
      <button type="button" disabled={!api.isChecked} on:click={() => api.setChecked(false)}> Uncheck </button>
      <button type="reset">Reset Form</button>
    </fieldset>
  </form>
</main>

<Toolbar>
  <ControlsUI slot="controls" {context} controls={checkboxControls} />
  <StateVisualizer state={$state} />
</Toolbar>
