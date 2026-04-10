<script lang="ts">
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as tree from "@zag-js/tree-view"
  import { ChevronRightIcon } from "lucide-svelte"

  interface Node {
    id: string
    name: string
    children?: Node[]
  }

  interface TreeNodeProps {
    node: Node
    indexPath: number[]
    api: tree.Api
  }

  const collection = tree.collection<Node>({
    nodeToValue: (node) => node.id,
    nodeToString: (node) => node.name,
    rootNode: {
      id: "ROOT",
      name: "",
      children: [
        {
          id: "node_modules",
          name: "node_modules",
          children: [
            { id: "node_modules/zag-js", name: "zag-js" },
            { id: "node_modules/pandacss", name: "panda" },
          ],
        },
        {
          id: "src",
          name: "src",
          children: [
            { id: "src/app.tsx", name: "app.tsx" },
            { id: "src/index.ts", name: "index.ts" },
          ],
        },
        { id: "panda.config", name: "panda.config.ts" },
        { id: "package.json", name: "package.json" },
      ],
    },
  })

  const id = $props.id()
  const service = useMachine(tree.machine, {
    id,
    collection,
    defaultCheckedValue: [],
  })

  const api = $derived(tree.connect(service, normalizeProps))
</script>

{#snippet treeNode(nodeProps: TreeNodeProps)}
  {@const { node, indexPath, api } = nodeProps}
  {@const nodeState = api.getNodeState({ indexPath, node })}
  {@const checked = nodeState.checked}

  <div {...api.getNodeGroupProps({ indexPath, node })}>
    <div {...api.getNodeProps({ indexPath, node })}>
      <div {...api.getCellProps({ indexPath, node })}>
        <span {...api.getNodeCheckboxProps({ indexPath, node })}>
          {#if checked === true}
            ☑
          {:else if checked === "indeterminate"}
            ☐
          {:else}
            ☐
          {/if}
        </span>
      </div>
      <div {...api.getCellProps({ indexPath, node })}>
        <span {...api.getNodeTextProps({ indexPath, node })}>{node.name}</span>
        {#if nodeState.isBranch}
          <span {...api.getNodeIndicatorProps({ indexPath, node, type: "expanded" })}>
            <ChevronRightIcon />
          </span>
        {/if}
      </div>
    </div>
    {#if nodeState.isBranch}
      <div {...api.getNodeGroupContentProps({ indexPath, node })}>
        <div {...api.getIndentGuideProps({ indexPath, node })}></div>
        {#each node.children || [] as childNode, index}
          {@render treeNode({ node: childNode, indexPath: [...indexPath, index], api })}
        {/each}
      </div>
    {/if}
  </div>
{/snippet}

<main class="tree-view">
  <div {...api.getRootProps()}>
    <h3 {...api.getLabelProps()}>My Documents</h3>
    <div {...api.getTreeProps()}>
      {#each collection.rootNode.children || [] as node, index}
        {@render treeNode({ node, indexPath: [index], api })}
      {/each}
    </div>
  </div>
  <pre>{JSON.stringify(api.checkedValue, null, 2)}</pre>
</main>
