<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import { useListVirtualizer } from "#lib/use-virtualizer.svelte.ts"
  import * as dnd from "@zag-js/dnd"
  import * as tree from "@zag-js/tree-view"
  import styles from "@styles/dnd-virtualized-tree.module.css"
  import { ChevronRightIcon, FileIcon, FolderIcon } from "lucide-svelte"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"

  const estimateSize = () => ROW_HEIGHT

  interface Node {
    id: string
    name: string
    children?: Node[]
  }

  const ROW_HEIGHT = 32

  function createRoot(): Node {
    return {
      id: "ROOT",
      name: "",
      children: Array.from({ length: 32 }, (_, folderIndex) => ({
        id: `folder-${folderIndex}`,
        name: `folder ${folderIndex + 1}`,
        children:
          folderIndex === 0
            ? [
                {
                  id: "folder-0/archive",
                  name: "archive",
                  children: Array.from({ length: 6 }, (_, fileIndex) => ({
                    id: `folder-0/archive/file-${fileIndex}`,
                    name: `archive-${fileIndex + 1}.tsx`,
                  })),
                },
                ...Array.from({ length: 18 }, (_, fileIndex) => ({
                  id: `folder-${folderIndex}/file-${fileIndex}`,
                  name: `file-${folderIndex + 1}-${fileIndex + 1}.tsx`,
                })),
              ]
            : Array.from({ length: 18 }, (_, fileIndex) => ({
                id: `folder-${folderIndex}/file-${fileIndex}`,
                name: `file-${folderIndex + 1}-${fileIndex + 1}.tsx`,
              })),
      })),
    }
  }

  function createCollection(rootNode: Node) {
    return tree.collection<Node>({
      rootNode,
      nodeToValue: (node) => node.id,
      nodeToString: (node) => node.name,
    })
  }

  function getCollapsedExpandedValues(
    collection: ReturnType<typeof createCollection>,
    expanded: string[],
    dragSource: string | null,
  ) {
    if (!dragSource) return expanded

    const sourceNode = collection.findNode(dragSource)
    if (!sourceNode || !collection.isBranchNode(sourceNode)) return expanded

    const collapsed = new Set([dragSource, ...collection.getDescendantValues(dragSource, { withBranch: true })])

    return expanded.filter((value) => !collapsed.has(value))
  }

  let collection = $state(createCollection(createRoot()))
  let expanded = $state<string[]>(["folder-0", "folder-1", "folder-2"])
  let query = $state("")

  const id = $props.id()
  const treeId = `${id}-tree`
  const dndId = `${id}-dnd`

  const visibleCollection = $derived.by(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return collection
    return collection.filter((node) => node.name.toLowerCase().includes(normalized))
  })

  const dndService = useMachine(dnd.machine, {
    id: dndId,
    orientation: "vertical",
    dropPlacements: ["before", "after", "on"],
    activationConstraint: { distance: 6 },
    scrollThreshold: 36,
    scrollMaxSpeed: 12,
    getValueText(value) {
      return collection.stringify(value) ?? value
    },
    canDrop(source, target, placement) {
      if (source === target && placement === "on") return false
      const targetNode = collection.findNode(target)
      if (placement === "on" && (!targetNode || !collection.isBranchNode(targetNode))) return false
      const sourcePath = collection.getIndexPath(source)
      const targetPath = collection.getIndexPath(target)
      if (sourcePath && targetPath) {
        return !collection.contains(sourcePath, targetPath)
      }
      return true
    },
    onDrop({ source, target, placement }) {
      const sourcePath = collection.getIndexPath(source)
      const targetPath = collection.getIndexPath(target)
      if (!sourcePath || !targetPath) return

      let toPath: number[]
      switch (placement) {
        case "before":
          toPath = targetPath
          break
        case "after":
          toPath = [...targetPath.slice(0, -1), targetPath[targetPath.length - 1] + 1]
          break
        case "on":
          toPath = [...targetPath, 0]
          expanded = [...new Set([...expanded, target])]
          break
      }

      collection = collection.move([sourcePath], toPath)
    },
  })

  const dndApi = $derived(dnd.connect(dndService, normalizeProps))
  const dragSource = $derived(dndApi.dragSource)

  const expandedValue = $derived.by(() => {
    const base = query ? visibleCollection.getBranchValues() : expanded
    return getCollapsedExpandedValues(collection, base, dragSource)
  })

  const treeService = useMachine(tree.machine, () => ({
    id: treeId,
    collection: visibleCollection,
    expandedValue,
    scrollToIndexFn(details: tree.ScrollToIndexDetails) {
      virtualizer.scrollToIndex(details.index, { align: "auto" })
    },
    onExpandedChange(details: tree.ExpandedChangeDetails) {
      if (query) return
      expanded = details.expandedValue
    },
  }))

  const api = $derived(tree.connect(treeService, normalizeProps))
  const visibleNodes = $derived(api.getVisibleNodes())

  const { virtualizer, init } = useListVirtualizer(() => ({
    count: visibleNodes.length,
    estimatedSize: estimateSize,
    overscan: 8,
  }))

  const range = $derived(virtualizer.getRange())

  const draggedNode = $derived(dragSource ? collection.findNode(dragSource) : undefined)
  const draggedIsBranch = $derived(draggedNode ? collection.isBranchNode(draggedNode) : false)
  const draggedItemCount = $derived(
    draggedIsBranch && dragSource ? collection.getDescendantValues(dragSource, { withBranch: true }).length : undefined,
  )
  const dragPreviewProps = $derived(dndApi.getDragPreviewProps())
</script>

{#snippet nodeLabel(isBranch: boolean, name: string, itemCount?: number)}
  {#if isBranch}
    <span class={styles.chevron}>
      <ChevronRightIcon size={14} />
    </span>
    <FolderIcon size={15} />
  {:else}
    <span class={styles.chevronSpacer} aria-hidden="true"></span>
    <FileIcon size={15} />
  {/if}
  <span class={styles.nodeText}>{name}</span>
  {#if isBranch && itemCount != null}
    <span class={styles.previewCount}>
      {itemCount}
      {itemCount === 1 ? "item" : "items"}
    </span>
  {/if}
{/snippet}

{#snippet treeNode(node: Node, indexPath: number[], style: Record<string, any>)}
  {@const nodeProps = { node, indexPath }}
  {@const nodeState = api.getNodeState(nodeProps)}
  {@const value = nodeState.value}
  <div {...normalizeProps.element({ style })}>
    <div class={styles.row}>
      <div
        {...dndApi.getDropIndicatorProps({ value, placement: "before" })}
        class={styles.dropIndicator}
        style:--depth={nodeState.depth}
      ></div>

      <div
        {...mergeProps(
          api.getNodeProps(nodeProps),
          dndApi.getDraggableProps({ value }),
          dndApi.getDropTargetProps({ value }),
          {
            class: styles.node,
            style: { "--depth": nodeState.depth },
          },
        )}
      >
        <div {...api.getNodeCellProps(nodeProps)} class={styles.cell}>
          {#if nodeState.isBranch}
            <span {...api.getNodeIndicatorProps({ ...nodeProps, type: "expanded" })} class={styles.chevron}>
              <ChevronRightIcon size={14} />
            </span>
            <FolderIcon size={15} />
          {:else}
            <span class={styles.chevronSpacer} aria-hidden="true"></span>
            <FileIcon size={15} />
          {/if}
          <span {...api.getNodeTextProps(nodeProps)} class={styles.nodeText}>
            {node.name}
          </span>
        </div>
      </div>

      <div
        {...dndApi.getDropIndicatorProps({ value, placement: "after" })}
        class={styles.dropIndicator}
        style:--depth={nodeState.depth}
      ></div>
    </div>
  </div>
{/snippet}

<main>
  <div {...dndApi.getRootProps()} class={styles.root}>
    <div class={styles.header}>
      <div>
        <h2 {...api.getLabelProps()}>Virtualized Tree</h2>
        <p>Drag nodes to reorder or move items into folders. Folders collapse while dragging.</p>
      </div>
      <input bind:value={query} placeholder="Filter visible nodes..." class={styles.searchInput} />
    </div>

    <div class={styles.stats}>
      <span>{visibleNodes.length} visible nodes</span>
      <span>mounted rows {visibleNodes.length ? `${range.startIndex + 1}-${range.endIndex + 1}` : "0"}</span>
      <span>drop {dndApi.dropTarget ? `${dndApi.dropTarget} ${dndApi.dropPlacement}` : "none"}</span>
    </div>

    <div {@attach init} onscroll={virtualizer.handleScroll} class={styles.viewport}>
      <div {...api.getTreeProps()} class={styles.sizer} style:height="{virtualizer.getTotalSize()}px">
        {#each virtualizer.getVirtualItems() as virtualItem (visibleNodes[virtualItem.index]?.node.id ?? virtualItem.index)}
          {@const item = visibleNodes[virtualItem.index]}
          {#if item}
            {@const isDropTarget = dndApi.dropTarget === item.node.id}
            {@render treeNode(item.node, item.indexPath, {
              ...virtualizer.getItemStyle(virtualItem),
              height: `${virtualItem.size}px`,
              zIndex: isDropTarget ? 2 : undefined,
              overflow: "visible",
            })}
          {/if}
        {/each}
      </div>
    </div>

    <div class={styles.actions}>
      <button type="button" onclick={() => api.expand()}>Expand all</button>
      <button type="button" onclick={() => api.collapse()}>Collapse all</button>
    </div>

    {#if dndApi.isDragging && draggedNode}
      <!-- the `translate` property composes with the preview's own transform -->
      <div
        {...dragPreviewProps}
        class={styles.dragPreview}
        style:width="auto"
        style:height="auto"
        style:translate="6px -10px"
      >
        <div class={styles.previewNode}>
          {@render nodeLabel(draggedIsBranch, draggedNode.name, draggedItemCount)}
        </div>
      </div>
    {/if}
  </div>
</main>

<Toolbar>
  <StateVisualizer state={dndService} />
</Toolbar>
