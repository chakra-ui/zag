<script lang="ts">
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as select from "@zag-js/select"
  import { selectControls, selectData } from "@zag-js/shared"
  import { normalizeProps, portal, useMachine } from "@zag-js/svelte"
  import serialize from "form-serialize"

  const controls = useControls(selectControls)

  const [_state, send] = useMachine(
    select.machine({
      id: "1",
      name: "select",
      collection: select.collection({ items: selectData }),
    }),
    {
      context: controls.context,
    },
  )

  const api = $derived(select.connect(_state, send, normalizeProps))
</script>

<main class="select">
  <div {...api.rootProps}>
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label {...api.labelProps}>Label</label>

    <div {...api.controlProps}>
      <button {...api.triggerProps}>
        <span>{api.valueAsString || "Select option"}</span>
        <span {...api.indicatorProps}>▼</span>
      </button>
      <button {...api.clearTriggerProps}>X</button>
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
      <select {...api.hiddenSelectProps}>
        {#each selectData as option}
          <option value={option.value}>
            {option.label}
          </option>
        {/each}
      </select>
    </form>

    <div use:portal {...api.positionerProps}>
      <ul {...api.contentProps}>
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

<Toolbar {controls} state={_state} omit={["collection"]} />
