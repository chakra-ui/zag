<script lang="ts">
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as tree from "@zag-js/tree-view"
  import { ChevronRightIcon, FileIcon, FolderIcon } from "lucide-svelte"
  import "@styles/tree-view.css"

  interface Node {
    id: string
    name: string
    children?: Node[]
  }

  const initialCollection = tree.collection<Node>({
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

  let collection = $state.raw(initialCollection)

  const id = $props.id()
  const service = useMachine(tree.machine as tree.Machine<Node>, () => ({
    id,
    collection,
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
    <input
      type="text"
      class="tree-view-search"
      placeholder="Search files…"
      oninput={(e) => {
        const value = e.currentTarget.value
        if (value.length === 0) {
          collection = initialCollection
        } else {
          const filtered = initialCollection.filter((node) => node.name.includes(value))
          collection = filtered
          api.setExpandedValue(filtered.getBranchValues())
        }
      }}
    />
    <h3 {...api.getLabelProps()}>My Documents</h3>
    <div {...api.getTreeProps()}>
      {#each collection.rootNode.children ?? [] as node, index (node.id)}
        {@render treeNode(node, [index])}
      {/each}
    </div>
  </div>
</main>
