<script lang="ts">
  import Portal from "$lib/components/portal.svelte"
  import Presence from "$lib/components/presence.svelte"
  import * as menu from "@zag-js/menu"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import * as tree from "@zag-js/tree-view"
  import { ChevronRightIcon, FileIcon, FolderIcon, MoreVerticalIcon } from "lucide-svelte"
  import "@styles/tree-view.css"
  import "@styles/menu.css"

  interface Node {
    id: string
    name: string
    children?: Node[]
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

  const id = $props.id()
  const treeService = useMachine(tree.machine, { id, collection })
  const treeApi = $derived(tree.connect(treeService, normalizeProps))

  const menuService = useMachine(menu.machine, { id: `${id}-menu` })
  const menuApi = $derived(menu.connect(menuService, normalizeProps))
</script>

{#snippet treeNode(node: Node, indexPath: number[])}
  {@const nodeProps = { indexPath, node }}
  {@const nodeState = treeApi.getNodeState(nodeProps)}
  <div {...treeApi.getNodeGroupProps(nodeProps)}>
    <div {...treeApi.getNodeProps(nodeProps)}>
      <div {...treeApi.getNodeCellProps(nodeProps)}>
        {#if nodeState.isBranch}
          <FolderIcon />
        {:else}
          <FileIcon />
        {/if}
        <span {...treeApi.getNodeTextProps(nodeProps)}>{node.name}</span>
        {#if nodeState.isBranch}
          <span {...treeApi.getNodeIndicatorProps({ ...nodeProps, type: "expanded" })}>
            <ChevronRightIcon />
          </span>
        {/if}
      </div>
      <div {...treeApi.getNodeCellProps(nodeProps)}>
        <button
          {...mergeProps(menuApi.getTriggerProps({ value: nodeState.value }), {
            style: "background: none; border: none; cursor: pointer; padding: 2px",
          })}
        >
          <MoreVerticalIcon size={14} />
        </button>
      </div>
    </div>
    {#if nodeState.isBranch}
      <div {...treeApi.getNodeGroupContentProps(nodeProps)}>
        <div {...treeApi.getIndentGuideProps(nodeProps)}></div>
        {#each node.children ?? [] as childNode, index (childNode.id)}
          {@render treeNode(childNode, [...indexPath, index])}
        {/each}
      </div>
    {/if}
  </div>
{/snippet}

<main class="tree-view">
  <div {...treeApi.getRootProps()}>
    <h3 {...treeApi.getLabelProps()}>My Documents</h3>
    <div style="display: flex; gap: 10px">
      <button onclick={() => treeApi.collapse()}>Collapse All</button>
      <button onclick={() => treeApi.expand()}>Expand All</button>
    </div>
    <div {...treeApi.getTreeProps()}>
      {#each collection.rootNode.children ?? [] as node, index (node.id)}
        {@render treeNode(node, [index])}
      {/each}
    </div>
  </div>

  <Portal>
    <div {...menuApi.getPositionerProps()}>
      <Presence {...menuApi.getContentProps()}>
        <div {...menuApi.getItemProps({ value: "rename" })}>Rename "{menuApi.triggerValue}"</div>
        <div {...menuApi.getItemProps({ value: "duplicate" })}>Duplicate</div>
        <div {...menuApi.getItemProps({ value: "delete" })}>Delete</div>
      </Presence>
    </div>
  </Portal>
</main>
