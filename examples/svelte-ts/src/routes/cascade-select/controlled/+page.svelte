<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import CascadeSelectNode, { type CascadeNode } from "#lib/components/cascade-select-node.svelte"
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import { useControls } from "#lib/use-controls.svelte.ts"
  import * as cascadeSelect from "@zag-js/cascade-select"
  import { cascadeSelectControls, cascadeSelectData } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { XIcon } from "lucide-svelte"
  import serialize from "form-serialize"
  import "@styles/cascade-select.css"

  const collection = cascadeSelect.collection<CascadeNode>({
    nodeToValue: (node) => node.value,
    nodeToString: (node) => node.label,
    nodeToChildren: (node) => node.continents ?? node.countries ?? node.states,
    rootNode: cascadeSelectData,
  })

  const controls = useControls(cascadeSelectControls)

  let open = $state(false)

  const id = $props.id()
  const service = useMachine(
    cascadeSelect.machine,
    controls.mergeProps<cascadeSelect.Props>(() => ({
      id,
      collection,
      name: "location",
      open,
      onHighlightChange(details) {
        console.log("onHighlightChange", details)
      },
      onValueChange(details) {
        console.log("onChange", details)
      },
      onOpenChange(details) {
        open = details.open
        console.log("onOpenChange", details)
      },
    })),
  )

  const api = $derived(cascadeSelect.connect(service, normalizeProps))
</script>

<main class="cascade-select">
  <div {...api.getRootProps()}>
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label {...api.getLabelProps()}>Select a location</label>

    <button onclick={() => (open = !open)}>Toggle (external)</button>

    <div {...api.getControlProps()}>
      <button {...api.getTriggerProps()}>
        <span {...api.getValueTextProps()}>{api.valueAsString || "Select a location"}</span>
        <span {...api.getIndicatorProps()}>▼</span>
      </button>
      <button {...api.getClearTriggerProps()}>
        <XIcon size={16} />
      </button>
    </div>

    <form
      onchange={(e) => {
        const formData = serialize(e.currentTarget, { hash: true })
        console.log(formData)
      }}
    >
      <input {...api.getHiddenInputProps()} />
    </form>

    <Portal>
      <div {...api.getPositionerProps()}>
        <div {...api.getContentProps()}>
          <CascadeSelectNode node={collection.rootNode} {api} {collection} />
        </div>
      </div>
    </Portal>
  </div>

  <div style="margin-top: 350px">
    <h3>Highlighted Value:</h3>
    <pre>{JSON.stringify(api.highlightedValue, null, 2)}</pre>
  </div>
  <div style="margin-top: 20px">
    <h3>Selected Value:</h3>
    <pre>{JSON.stringify(api.value, null, 2)}</pre>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} omit={["collection"]} />
</Toolbar>
