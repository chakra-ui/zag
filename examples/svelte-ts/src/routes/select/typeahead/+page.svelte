<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import * as select from "@zag-js/select"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { ChevronsUpDownIcon, XIcon } from "lucide-svelte"
  import "@styles/select.css"

  interface Item {
    label: string
    value: string
    disabled?: boolean
  }

  const id = $props.id()
  const service = useMachine(select.machine as select.Machine<Item>, {
    id,
    collection: select.collection<Item>({
      items: [
        { label: "Apple", value: "apple" },
        { label: "Banana", value: "banana" },
        { label: "Cherry", value: "cherry" },
        { label: "Coconut", value: "coconut" },
        { label: "Date", value: "date" },
        { label: "Duck", value: "duck", disabled: true },
        { label: "Elephant", value: "elephant" },
        { label: "Fish", value: "fish" },
        { label: "Giraffe", value: "giraffe" },
        { label: "Hippo", value: "hippo" },
        { label: "Igloo", value: "igloo" },
      ],
    }),
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
      </button>
      <div class="select-indicator-group">
        <button {...api.getClearTriggerProps()}>
          <XIcon />
        </button>
        <span {...api.getIndicatorProps()}>
          <ChevronsUpDownIcon />
        </span>
      </div>
    </div>
    <Portal>
      <div {...api.getPositionerProps()}>
        <div {...api.getContentProps()}>
          <div {...api.getListProps()}>
            {#each api.collection.items as item (item.value)}
              <div {...api.getItemProps({ item })}>
                <span {...api.getItemTextProps({ item })}>{item.label}</span>
                <span {...api.getItemIndicatorProps({ item })}>✓</span>
              </div>
            {/each}
          </div>
        </div>
      </div>
    </Portal>
  </div>
</main>
