<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import CascadeSelectNode, { type CascadeNode } from "#lib/components/cascade-select-node.svelte"
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import * as cascadeSelect from "@zag-js/cascade-select"
  import { cascadeSelectData } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { ChevronsUpDownIcon } from "lucide-svelte"
  import "@styles/cascade-select.css"

  const collection = cascadeSelect.collection<CascadeNode>({
    nodeToValue: (node) => node.value,
    nodeToString: (node) => node.label,
    nodeToChildren: (node) => node.continents ?? node.countries ?? node.states,
    rootNode: cascadeSelectData,
  })

  let value = $state<string[][]>([])
  let submitted = $state(false)
  let output = $state("")

  const invalid = $derived(submitted && value.length === 0)

  const id = $props.id()
  const service = useMachine(cascadeSelect.machine, () => ({
    id,
    collection,
    name: "region",
    required: true,
    invalid,
    onValueChange: (details) => (value = details.value),
  }))
  const api = $derived(cascadeSelect.connect(service, normalizeProps))

  function onsubmit(event: SubmitEvent & { currentTarget: HTMLFormElement }) {
    event.preventDefault()
    submitted = true
    if (value.length === 0) return
    const data = new FormData(event.currentTarget)
    output = [...data.entries()].map(([key, entry]) => `${key}=${entry}`).join("\n")
  }

  function onreset() {
    api.clearValue()
    submitted = false
    output = ""
  }
</script>

<main>
  <div class="cascade-select-form">
    <form novalidate {onsubmit} {onreset}>
      <div {...api.getRootProps()}>
        <!-- svelte-ignore a11y_label_has_associated_control -->
        <label {...api.getLabelProps()}>Delivery region</label>
        <div {...api.getControlProps()}>
          <button {...api.getTriggerProps()}>
            <span {...api.getValueTextProps()}>{api.valueAsString || "Select a region"}</span>
          </button>
          <span {...api.getIndicatorProps()}>
            <ChevronsUpDownIcon />
          </span>
        </div>
        <input {...api.getHiddenInputProps()} />
        <Portal>
          <div {...api.getPositionerProps()}>
            <div {...api.getContentProps()}>
              <CascadeSelectNode node={collection.rootNode} {api} {collection} />
            </div>
          </div>
        </Portal>
      </div>
      {#if invalid}
        <p class="error" role="alert">Choose a delivery region</p>
      {/if}
      <div class="actions">
        <button type="submit">Save address</button>
        <button type="reset">Clear form</button>
      </div>
    </form>
    {#if output}
      <pre data-testid="form-output">{output}</pre>
    {/if}
  </div>
</main>

<Toolbar viz>
  <StateVisualizer state={service} omit={["collection"]} />
</Toolbar>
