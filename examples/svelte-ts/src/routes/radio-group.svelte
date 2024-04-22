<script lang="ts">
  import * as radio from "@zag-js/radio-group"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { radioControls, radioData } from "@zag-js/shared"
  import serialize from "form-serialize"
  import { useControls } from "$lib/use-controls.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"

  const controls = useControls(radioControls)

  const [snapshot, send] = useMachine(radio.machine({ id: "1", name: "fruit" }), {
    context: controls.context,
  })

  const api = $derived(radio.connect(snapshot, send, normalizeProps))
</script>

<main class="radio">
  <form
    oninput={(e) => {
      const result = serialize(e.currentTarget, { hash: true })
      console.log(result)
    }}
  >
    <fieldset disabled={false}>
      <div {...api.rootProps}>
        <h3 {...api.labelProps}>Fruits</h3>
        <div {...api.indicatorProps}></div>
        {#each radioData as opt}
          <label data-testid={`radio-${opt.id}`} {...api.getItemProps({ value: opt.id })}>
            <div data-testid={`control-${opt.id}`} {...api.getItemControlProps({ value: opt.id })}></div>
            <span data-testid={`label-${opt.id}`} {...api.getItemTextProps({ value: opt.id })}>
              {opt.label}
            </span>
            <input data-testid={`input-${opt.id}`} {...api.getItemHiddenInputProps({ value: opt.id })} />
          </label>
        {/each}
      </div>

      <button type="reset">Reset</button>
      <button type="button" onclick={() => api.clearValue()}> Clear </button>
      <button type="button" onclick={() => api.setValue("mango")}> Set to Mangoes </button>
      <button type="button" onclick={() => api.focus()}> Focus </button>
    </fieldset>
  </form>
</main>

<Toolbar {controls}>
  <StateVisualizer state={snapshot} />
</Toolbar>
