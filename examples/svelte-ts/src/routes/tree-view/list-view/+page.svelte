<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as tree from "@zag-js/tree-view"
  import { ChevronRightIcon, FileIcon, FolderIcon, ListIcon, ListTreeIcon } from "lucide-svelte"
  import "@styles/tree-view.css"

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

  const rootNode: Node = {
    id: "ROOT",
    name: "",
    children: [
      {
        id: "node_modules",
        name: "node_modules",
        children: [
          { id: "node_modules/zag-js", name: "zag-js" },
          { id: "node_modules/pandacss", name: "panda" },
          {
            id: "node_modules/@types",
            name: "@types",
            children: [
              { id: "node_modules/@types/react", name: "react" },
              { id: "node_modules/@types/react-dom", name: "react-dom" },
            ],
          },
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
      { id: "readme.md", name: "README.md" },
    ],
  }

  const options = { nodeToValue: (node: Node) => node.id, nodeToString: (node: Node) => node.name }
  const treeCollection = tree.collection<Node>({ ...options, rootNode })

  // Every file as one row, named by its full path. Ids match the tree, so selection carries over.
  const files = treeCollection.getDescendantNodes([]).map((node) => ({
    id: node.id,
    name: [...treeCollection.getParentNodes(node.id), node].map((n) => n.name).join("/"),
  }))

  const listCollection = tree.collection<Node>({ ...options, rootNode: { ...rootNode, children: files } })

  type View = "tree" | "list"

  let view = $state<View>("tree")
  const collection = $derived(view === "tree" ? treeCollection : listCollection)

  const id = $props.id()
  const service = useMachine(tree.machine, () => ({ id, collection }))
  const api = $derived(tree.connect(service, normalizeProps))
</script>

{#snippet treeNode(nodeProps: TreeNodeProps)}
  {@const { node, indexPath, api } = nodeProps}
  {@const nodeState = api.getNodeState({ indexPath, node })}

  <div {...api.getNodeGroupProps({ indexPath, node })}>
    <div {...api.getNodeProps({ indexPath, node })}>
      <div {...api.getNodeCellProps({ indexPath, node })}>
        {#if nodeState.isBranch}
          <FolderIcon />
        {:else}
          <FileIcon />
        {/if}
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
        {#each node.children || [] as childNode, index (childNode.id)}
          {@render treeNode({ node: childNode, indexPath: [...indexPath, index], api })}
        {/each}
      </div>
    {/if}
  </div>
{/snippet}

<main class="tree-view">
  <div {...api.getRootProps()}>
    <h3 {...api.getLabelProps()}>My Documents</h3>
    <div style="display: flex; gap: 10px">
      <button aria-pressed={view === "tree"} onclick={() => (view = "tree")}><ListTreeIcon /> Tree</button>
      <button aria-pressed={view === "list"} onclick={() => (view = "list")}><ListIcon /> List</button>
    </div>
    <div {...api.getTreeProps()}>
      {#each collection.rootNode.children || [] as node, index (node.id)}
        {@render treeNode({ node, indexPath: [index], api })}
      {/each}
    </div>
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} />
</Toolbar>
