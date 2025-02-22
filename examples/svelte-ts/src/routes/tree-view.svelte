<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import { treeviewControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as tree from "@zag-js/tree-view"
  import { FileIcon, FolderIcon, ChevronRightIcon } from "lucide-svelte"

  const controls = useControls(treeviewControls)

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
        { id: "renovate.json", name: "renovate.json" },
        { id: "readme.md", name: "README.md" },
      ],
    },
  })

  const service = useMachine(tree.machine, {
    id: "1",
    collection,
  })

  const api = $derived(tree.connect(service, normalizeProps))
</script>

{#snippet treeNode(nodeProps: TreeNodeProps)}
  {@const { node, indexPath, api } = nodeProps}
  {@const nodeState = api.getNodeState({ indexPath, node })}

  {#if nodeState.isBranch}
    <div {...api.getBranchProps({ indexPath, node })}>
      <div {...api.getBranchControlProps({ indexPath, node })}>
        <FolderIcon />
        <span {...api.getBranchTextProps({ indexPath, node })}>{node.name}</span>
        <span {...api.getBranchIndicatorProps({ indexPath, node })}>
          <ChevronRightIcon />
        </span>
      </div>
      <div {...api.getBranchContentProps({ indexPath, node })}>
        <div {...api.getBranchIndentGuideProps({ indexPath, node })}></div>
        {#each node.children || [] as childNode, index}
          {@render treeNode({ node: childNode, indexPath: [...indexPath, index], api })}
        {/each}
      </div>
    </div>
  {:else}
    <div {...api.getItemProps({ indexPath, node })}>
      <FileIcon />
      {node.name}
    </div>
  {/if}
{/snippet}

<main class="tree-view">
  <div {...api.getRootProps()}>
    <h3 {...api.getLabelProps()}>My Documents</h3>
    <div style="display: flex; gap: 10px">
      <button onclick={() => api.collapse()}>Collapse All</button>
      <button onclick={() => api.expand()}>Expand All</button>
      {#if controls.context.selectionMode === "multiple"}
        <button onclick={() => api.select()}>Select All</button>
        <button onclick={() => api.deselect()}>Deselect All</button>
      {/if}
    </div>
    <div {...api.getTreeProps()}>
      {#each collection.rootNode.children || [] as node, index}
        {@render treeNode({ node, indexPath: [index], api })}
      {/each}
    </div>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
