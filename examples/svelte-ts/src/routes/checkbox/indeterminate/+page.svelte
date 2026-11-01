<script lang="ts">
  import Checkbox from "#lib/components/checkbox.svelte"
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import * as checkbox from "@zag-js/checkbox"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { CheckIcon, MinusIcon } from "lucide-svelte"
  import "@styles/checkbox.css"

  const toppings = ["Cheese", "Mushrooms", "Olives"]

  let selected = $state<string[]>(["Cheese"])

  // Derived from the children: none, some (indeterminate) or all
  const allState = $derived<checkbox.CheckedState>(
    selected.length === 0 ? false : selected.length === toppings.length ? true : "indeterminate",
  )

  const id = $props.id()
  const service = useMachine(checkbox.machine, () => ({
    id,
    name: "all",
    checked: allState,
    onCheckedChange({ checked }) {
      selected = checked === true ? [...toppings] : []
    },
  }))

  const api = $derived(checkbox.connect(service, normalizeProps))
</script>

<main class="checkbox">
  <div class="vstack gap-3">
    <label {...api.getRootProps()}>
      <div {...api.getControlProps()}>
        <span {...api.getIndicatorProps()}>
          {#if api.indeterminate}
            <MinusIcon />
          {:else}
            <CheckIcon />
          {/if}
        </span>
      </div>
      <span {...api.getLabelProps()}>All toppings</span>
      <input {...api.getHiddenInputProps()} data-testid="hidden-input" />
    </label>

    <div class="checkbox-children">
      {#each toppings as topping (topping)}
        <Checkbox
          label={topping}
          checked={selected.includes(topping)}
          onCheckedChange={({ checked }) =>
            (selected = checked ? [...selected, topping] : selected.filter((item) => item !== topping))}
        />
      {/each}
    </div>
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} />
</Toolbar>
