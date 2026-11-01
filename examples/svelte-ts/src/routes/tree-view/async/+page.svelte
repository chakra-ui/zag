<script lang="ts">
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as tree from "@zag-js/tree-view"
  import { ChevronRightIcon, FileIcon, FolderIcon, LoaderCircleIcon } from "lucide-svelte"
  import "@styles/tree-view.css"

  interface Node {
    id: string
    name: string
    children?: Node[]
    childrenCount?: number
  }

  const apiResult = {
    node_modules: [
      { id: "zag-js", name: "zag-js" },
      { id: "pandacss", name: "panda" },
      { id: "@types", name: "@types", childrenCount: 2 },
    ],
    "node_modules/@types": [
      { id: "@types/react", name: "react" },
      { id: "@types/react-dom", name: "react-dom" },
    ],
    src: [
      { id: "src/app.tsx", name: "app.tsx" },
      { id: "src/index.ts", name: "index.ts" },
    ],
  }

  function loadChildren(details: tree.LoadChildrenDetails<Node>): Promise<Node[]> {
    const value = details.valuePath.join("/")
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(apiResult[value as keyof typeof apiResult] ?? [])
      }, 1200)
    })
  }

  const initCollection = tree.collection<Node>({
    nodeToValue: (node) => node.id,
    nodeToString: (node) => node.name,
    rootNode: {
      id: "ROOT",
      name: "",
      children: [
        { id: "node_modules", name: "node_modules", childrenCount: 3 },
        { id: "src", name: "src", childrenCount: 2 },
        { id: "panda.config", name: "panda.config.ts" },
        { id: "package.json", name: "package.json" },
        { id: "renovate.json", name: "renovate.json" },
        { id: "readme.md", name: "README.md" },
      ],
    },
  })

  let collection = $state.raw(initCollection)

  const id = $props.id()
  const service = useMachine(tree.machine as tree.Machine<Node>, () => ({
    id,
    collection,
    loadChildren,
    onLoadChildrenComplete(details) {
      collection = details.collection
    },
  }))

  const api = $derived(tree.connect(service, normalizeProps))
</script>

{#snippet treeNode(node: Node, indexPath: number[])}
  {@const nodeProps = { indexPath, node }}
  {@const nodeState = api.getNodeState(nodeProps)}
  <div {...api.getNodeGroupProps(nodeProps)}>
    <div {...api.getNodeProps(nodeProps)}>
      <div {...api.getNodeCellProps(nodeProps)}>
        {#if nodeState.isBranch}
          <FolderIcon />
        {:else}
          <FileIcon />
        {/if}
        <span {...api.getNodeTextProps(nodeProps)}>{node.name}</span>
        {#if nodeState.loading}
          <LoaderCircleIcon class="tree-view-spinner" aria-hidden="true" />
        {/if}
        {#if nodeState.isBranch}
          <span {...api.getNodeIndicatorProps({ ...nodeProps, type: "expanded" })}>
            <ChevronRightIcon />
          </span>
        {/if}
      </div>
    </div>
    {#if nodeState.isBranch}
      <div {...api.getNodeGroupContentProps(nodeProps)}>
        <div {...api.getIndentGuideProps(nodeProps)}></div>
        {#each node.children ?? [] as childNode, index (childNode.id)}
          {@render treeNode(childNode, [...indexPath, index])}
        {/each}
      </div>
    {/if}
  </div>
{/snippet}

<main class="tree-view">
  <div {...api.getRootProps()}>
    <h3 {...api.getLabelProps()}>My Documents</h3>
    <div style="display: flex; gap: 10px">
      <button onclick={() => api.collapse()}>Collapse All</button>
      <button onclick={() => api.expand()}>Expand All</button>
      <button onclick={() => api.expand(["node_modules"])}>Expand node_modules</button>
      <button onclick={() => api.collapse(["node_modules"])}>Collapse node_modules</button>
    </div>
    <div {...api.getTreeProps()}>
      {#each collection.rootNode.children ?? [] as node, index (node.id)}
        {@render treeNode(node, [index])}
      {/each}
    </div>
  </div>
</main>
