<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import { useControls } from "#lib/use-controls.svelte.ts"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
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

  const controls = useControls({})
  let collection = $state.raw(initialCollection)

  const id = $props.id()
  const service = useMachine(
    tree.machine as tree.Machine<Node>,
    controls.mergeProps<tree.Props<Node>>(() => ({
      id,
      collection,
      canRename: (node) => {
        // Only allow renaming leaf nodes (files), not branches (folders)
        return !node.children
      },
      onRenameComplete: (details) => {
        console.log("Rename complete:", details)
        const node = collection.at(details.indexPath)
        if (!node) return
        collection = collection.replace(details.indexPath, {
          ...node,
          name: details.label,
        })
      },
    })),
  )
  const api = $derived(tree.connect(service, normalizeProps))
</script>

{#snippet treeNode(node: Node, indexPath: number[])}
  {@const nodeProps = { indexPath, node }}
  {@const nodeState = api.getNodeState(nodeProps)}
  <div {...api.getNodeGroupProps(nodeProps)}>
    <div {...api.getNodeProps(nodeProps)}>
      <div {...api.getNodeCellProps(nodeProps)}>
        {#if nodeState.renaming}
          <input {...api.getNodeRenameInputProps(nodeProps)} />
        {:else}
          {#if nodeState.isBranch}
            <FolderIcon />
          {:else}
            <FileIcon />
          {/if}
          <span
            {...mergeProps(api.getNodeTextProps(nodeProps), {
              style: `display: ${nodeState.renaming ? "none" : "inline"}`,
            })}
          >
            {node.name}
          </span>
          {#if nodeState.isBranch}
            <span {...api.getNodeIndicatorProps({ ...nodeProps, type: "expanded" })}>
              <ChevronRightIcon />
            </span>
          {/if}
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
    <h3 {...api.getLabelProps()}>My Documents (Renameable)</h3>
    <p style="font-size: 14px; color: #666; margin-bottom: 10px">
      Press F2 on any <strong>file</strong> to rename it (folders cannot be renamed). Empty names and duplicates are prevented.
    </p>
    <div style="display: flex; gap: 10px; margin-bottom: 10px">
      <button onclick={() => api.collapse()}>Collapse All</button>
      <button onclick={() => api.expand()}>Expand All</button>
    </div>
    <div {...api.getTreeProps()}>
      {#each collection.rootNode.children ?? [] as node, index (node.id)}
        {@render treeNode(node, [index])}
      {/each}
    </div>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
