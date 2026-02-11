<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as cascadeSelect from "@zag-js/cascade-select"
  import { cascadeSelectControls, cascadeSelectData } from "@zag-js/shared"
  import { normalizeProps, portal, useMachine } from "@zag-js/svelte"

  interface Node {
    label: string
    value: string
    continents?: Node[]
    countries?: Node[]
    code?: string
    states?: Node[]
  }

  interface TreeNodeProps {
    node: Node
    indexPath: number[]
    value: string[]
    api: cascadeSelect.Api
  }

  const collection = cascadeSelect.collection<Node>({
    nodeToValue: (node) => node.value,
    nodeToString: (node) => node.label,
    nodeToChildren: (node) => node.continents ?? node.countries ?? node.states,
    rootNode: cascadeSelectData,
  })

  const controls = useControls(cascadeSelectControls)

  const id = $props.id()
  const service = useMachine(
    cascadeSelect.machine,
    controls.mergeProps<cascadeSelect.Props>({
      id,
      collection,
      name: "location",
    }),
  )

  const api = $derived(cascadeSelect.connect(service, normalizeProps))
</script>

{#snippet treeNode(nodeProps: TreeNodeProps)}
  {@const { node, indexPath, value, api } = nodeProps}
  {@const listNodeProps = { indexPath, value, item: node }}
  {@const nodeState = api.getItemState(listNodeProps)}
  {@const children = collection.getNodeChildren(node)}

  <ul {...api.getListProps(listNodeProps)}>
    {#each children as item, index}
      {@const itemProps = {
        indexPath: [...indexPath, index],
        value: [...value, collection.getNodeValue(item)],
        item,
      }}
      {@const itemState = api.getItemState(itemProps)}
      <li {...api.getItemProps(itemProps)}>
        <span {...api.getItemTextProps(itemProps)}>{item.label}</span>
        <span {...api.getItemIndicatorProps(itemProps)}>✓</span>
        {#if itemState.hasChildren}
          <span>{">"}</span>
        {/if}
      </li>
    {/each}
  </ul>
  {#if nodeState.highlightedChild && collection.isBranchNode(nodeState.highlightedChild)}
    {@render treeNode({
      node: nodeState.highlightedChild,
      api,
      indexPath: [...indexPath, nodeState.highlightedIndex],
      value: [...value, collection.getNodeValue(nodeState.highlightedChild)],
    })}
  {/if}
{/snippet}

<main class="cascade-select">
  <div {...api.getRootProps()}>
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label {...api.getLabelProps()}>Select a location</label>

    <div {...api.getControlProps()}>
      <button {...api.getTriggerProps()}>
        <span>{api.valueAsString || "Select a location"}</span>
        <span {...api.getIndicatorProps()}>▼</span>
      </button>
      <button {...api.getClearTriggerProps()}>X</button>
    </div>

    <input {...api.getHiddenInputProps()} />

    <div use:portal {...api.getPositionerProps()}>
      <div {...api.getContentProps()}>
        {@render treeNode({ node: collection.rootNode, api, indexPath: [], value: [] })}
      </div>
    </div>
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
