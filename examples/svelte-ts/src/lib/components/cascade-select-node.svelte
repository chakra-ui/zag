<script lang="ts" module>
  export interface CascadeNode {
    label: string
    value: string
    continents?: CascadeNode[]
    countries?: CascadeNode[]
    code?: string
    states?: CascadeNode[]
  }
</script>

<script lang="ts">
  import Self from "./cascade-select-node.svelte"
  import type { Api } from "@zag-js/cascade-select"
  import type { TreeCollection } from "@zag-js/collection"
  import { ChevronRightIcon } from "lucide-svelte"

  interface Props {
    node: CascadeNode
    indexPath?: number[]
    value?: string[]
    api: Api
    collection: TreeCollection<CascadeNode>
  }

  const { node, indexPath = [], value = [], api, collection }: Props = $props()

  const nodeProps = $derived({ indexPath, value, item: node })
  const nodeState = $derived(api.getItemState(nodeProps))
  const children = $derived(collection.getNodeChildren(node))
</script>

<ul {...api.getListProps(nodeProps)}>
  {#each children as item, index (item.label)}
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
        <span>
          <ChevronRightIcon size={16} />
        </span>
      {/if}
    </li>
  {/each}
</ul>
{#if nodeState.highlightedChild && collection.isBranchNode(nodeState.highlightedChild)}
  <Self
    node={nodeState.highlightedChild}
    {api}
    {collection}
    indexPath={[...indexPath, nodeState.highlightedIndex]}
    value={[...value, collection.getNodeValue(nodeState.highlightedChild)]}
  />
{/if}
