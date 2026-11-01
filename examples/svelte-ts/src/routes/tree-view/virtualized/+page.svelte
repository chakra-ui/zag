<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import { useControls } from "#lib/use-controls.svelte.ts"
  import { useListVirtualizer } from "#lib/use-virtualizer.svelte.ts"
  import { treeviewControls } from "@zag-js/shared"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import * as tree from "@zag-js/tree-view"
  import { ChevronRightIcon, FileIcon, FolderIcon } from "lucide-svelte"
  import "@styles/tree-view.css"

  const ROW_HEIGHT = 32
  const estimateSize = () => ROW_HEIGHT

  interface Node {
    id: string
    name: string
    children?: Node[]
  }

  function generateLargeTree(): Node {
    const folders: Node[] = []
    for (let i = 0; i < 50; i++) {
      const children: Node[] = []
      for (let j = 0; j < 20; j++) {
        children.push({ id: `folder-${i}/file-${j}.ts`, name: `file-${j}.ts` })
      }
      folders.push({ id: `folder-${i}`, name: `folder-${i}`, children })
    }
    return { id: "ROOT", name: "", children: folders }
  }

  const collection = tree.collection<Node>({
    nodeToValue: (node) => node.id,
    nodeToString: (node) => node.name,
    rootNode: generateLargeTree(),
  })

  const controls = useControls(treeviewControls)

  const id = $props.id()
  const service = useMachine(
    tree.machine,
    controls.mergeProps<tree.Props>({
      id,
      collection,
      scrollToIndexFn(details) {
        virtualizer.scrollToIndex(details.index, { align: "auto" })
      },
    }),
  )

  const api = $derived(tree.connect(service, normalizeProps))
  const visibleNodes = $derived(api.getVisibleNodes())

  const { virtualizer, init } = useListVirtualizer(() => ({
    count: visibleNodes.length,
    estimatedSize: estimateSize,
    overscan: 10,
  }))
</script>

{#snippet treeNode(node: Node, indexPath: number[])}
  {@const nodeProps = { indexPath, node }}
  {@const nodeState = api.getNodeState(nodeProps)}
  {@const indent = nodeState.depth * 20}
  <div
    {...mergeProps(api.getNodeProps(nodeProps), {
      style: `padding-left: ${indent}px; height: ${ROW_HEIGHT}px; display: flex; align-items: center; gap: 4px`,
    })}
  >
    <div {...api.getNodeCellProps(nodeProps)}>
      {#if nodeState.isBranch}
        <span {...api.getNodeIndicatorProps({ ...nodeProps, type: "expanded" })}>
          <ChevronRightIcon size={16} />
        </span>
        <FolderIcon size={16} />
      {:else}
        <FileIcon size={16} />
      {/if}
      <span {...api.getNodeTextProps(nodeProps)}>{node.name}</span>
    </div>
  </div>
{/snippet}

<main class="tree-view">
  <div {...api.getRootProps()}>
    <h3 {...api.getLabelProps()}>Virtualized Tree ({visibleNodes.length} visible nodes)</h3>
    <div style="display: flex; gap: 10px; margin-bottom: 10px">
      <button onclick={() => api.collapse()}>Collapse All</button>
      <button onclick={() => api.expand()}>Expand All</button>
      {#if controls.context.selectionMode === "multiple"}
        <button onclick={() => api.select()}>Select All</button>
        <button onclick={() => api.deselect()}>Deselect All</button>
      {/if}
    </div>

    <div
      {@attach init}
      {...mergeProps(api.getTreeProps(), {
        style: "height: 400px; overflow: auto; border: 1px solid #ccc; border-radius: 4px",
      })}
      onscroll={virtualizer.handleScroll}
    >
      <div style="height: {virtualizer.getTotalSize()}px; width: 100%; position: relative">
        {#each virtualizer.getVirtualItems() as vi (visibleNodes[vi.index]?.node.id ?? vi.index)}
          {@const visible = visibleNodes[vi.index]}
          {#if visible}
            <div data-index={vi.index} {...normalizeProps.element({ style: virtualizer.getItemStyle(vi) })}>
              {@render treeNode(visible.node, visible.indexPath)}
            </div>
          {/if}
        {/each}
      </div>
    </div>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} omit={["collection"]} />
</Toolbar>
