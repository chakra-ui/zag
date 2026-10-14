<script lang="ts">
  // Manual test: save an address in Chrome, autofill the street input, and the State select should update
  import Portal from "$lib/components/portal.svelte"
  import * as select from "@zag-js/select"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import { ChevronsUpDownIcon } from "lucide-svelte"
  import "@styles/select.css"

  const US_STATES = [
    { label: "Alabama", value: "AL" },
    { label: "California", value: "CA" },
    { label: "Florida", value: "FL" },
    { label: "New York", value: "NY" },
    { label: "Texas", value: "TX" },
  ]

  const id = $props.id()
  const service = useMachine(select.machine, {
    collection: select.collection({ items: US_STATES }),
    id,
    name: "state",
    autoComplete: "address-level1",
  })

  const api = $derived(select.connect(service, normalizeProps))
</script>

<main style="padding: 2rem; max-width: 400px">
  <h1>Select Autofill Test</h1>
  <p style="margin-bottom: 1rem; color: #666">
    Fill street address first, then use Chrome autofill. State should update.
  </p>

  <form
    onsubmit={(e) => {
      e.preventDefault()
      console.log("Form submitted", Object.fromEntries(new FormData(e.currentTarget)))
    }}
  >
    <div style="margin-bottom: 1rem">
      <label for="street">Street address</label>
      <input
        id="street"
        name="street"
        type="text"
        autocomplete="street-address"
        style="display: block; width: 100%; padding: 8px; margin-top: 4px"
      />
    </div>

    <div {...mergeProps(api.getRootProps(), { style: { marginBottom: "1rem" } })}>
      <!-- svelte-ignore a11y_label_has_associated_control -->
      <label {...api.getLabelProps()}>State</label>
      <div {...api.getControlProps()}>
        <button
          {...mergeProps(api.getTriggerProps(), {
            style: {
              display: "flex",
              width: "100%",
              padding: "8px",
              marginTop: "4px",
              justifyContent: "space-between",
              alignItems: "center",
            },
          })}
        >
          <span>{api.valueAsString || "Select state"}</span>
          <span {...api.getIndicatorProps()}>
            <ChevronsUpDownIcon />
          </span>
        </button>
      </div>

      <select {...api.getHiddenSelectProps()}>
        {#if api.empty}
          <option value=""></option>
        {/if}
        {#each US_STATES as opt (opt.value)}
          <option value={opt.value}>
            {opt.label}
          </option>
        {/each}
      </select>

      <Portal>
        <div {...api.getPositionerProps()}>
          <div {...api.getContentProps()}>
            <div {...api.getListProps()}>
              {#each US_STATES as item (item.value)}
                <div {...api.getItemProps({ item })}>
                  <span {...api.getItemTextProps({ item })}>{item.label}</span>
                </div>
              {/each}
            </div>
          </div>
        </div>
      </Portal>
    </div>

    <button type="submit">Submit</button>
  </form>
</main>
