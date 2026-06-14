"use client"

import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import { useListVirtualizer } from "@/hooks/use-virtualizer"
import * as dnd from "@zag-js/dnd"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/react"
import * as tree from "@zag-js/tree-view"
import type { VirtualItem } from "@zag-js/virtualizer"
import styles from "@styles/dnd-virtualized-tree.module.css"
import { ChevronRightIcon, FileIcon, FolderIcon } from "lucide-react"
import { type CSSProperties, type JSX, useEffect, useId, useMemo, useState } from "react"

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

interface NodeLabelProps {
  isBranch: boolean
  name: string
  itemCount?: number
}

function NodeLabel(props: NodeLabelProps): JSX.Element {
  const { isBranch, name, itemCount } = props

  return (
    <>
      {isBranch ? (
        <>
          <span className={styles.chevron}>
            <ChevronRightIcon size={14} />
          </span>
          <FolderIcon size={15} />
        </>
      ) : (
        <>
          <span className={styles.chevronSpacer} aria-hidden="true" />
          <FileIcon size={15} />
        </>
      )}
      <span className={styles.nodeText}>{name}</span>
      {isBranch && itemCount != null ? (
        <span className={styles.previewCount}>
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </span>
      ) : null}
    </>
  )
}

interface TreeNodeProps {
  api: tree.Api
  dndApi: dnd.Api
  indexPath: number[]
  node: Node
  style: CSSProperties
}

function TreeNode(props: TreeNodeProps): JSX.Element {
  const { api, dndApi, indexPath, node, style } = props
  const nodeProps = { node, indexPath }
  const nodeState = api.getNodeState(nodeProps)
  const value = nodeState.value

  return (
    <div style={style}>
      <div className={styles.row}>
        <div
          {...dndApi.getDropIndicatorProps({ value, placement: "before" })}
          className={styles.dropIndicator}
          style={{ ["--depth" as string]: nodeState.depth }}
        />

        <div
          {...mergeProps(
            api.getNodeProps(nodeProps),
            dndApi.getDraggableProps({ value }),
            dndApi.getDropTargetProps({ value }),
            {
              className: styles.node,
              style: { ["--depth" as string]: nodeState.depth },
            },
          )}
        >
          <div {...api.getNodeCellProps(nodeProps)} className={styles.cell}>
            {nodeState.isBranch ? (
              <>
                <span {...api.getNodeIndicatorProps({ ...nodeProps, type: "expanded" })} className={styles.chevron}>
                  <ChevronRightIcon size={14} />
                </span>
                <FolderIcon size={15} />
              </>
            ) : (
              <>
                <span className={styles.chevronSpacer} aria-hidden="true" />
                <FileIcon size={15} />
              </>
            )}
            <span {...api.getNodeTextProps(nodeProps)} className={styles.nodeText}>
              {node.name}
            </span>
          </div>
        </div>

        <div
          {...dndApi.getDropIndicatorProps({ value, placement: "after" })}
          className={styles.dropIndicator}
          style={{ ["--depth" as string]: nodeState.depth }}
        />
      </div>
    </div>
  )
}

export default function Page() {
  const [collection, setCollection] = useState(() => createCollection(createRoot()))
  const [expanded, setExpanded] = useState<string[]>(["folder-0", "folder-1", "folder-2"])
  const [query, setQuery] = useState("")

  const treeId = useId()
  const dndId = useId()

  const visibleCollection = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return collection
    return collection.filter((node) => node.name.toLowerCase().includes(normalized))
  }, [collection, query])

  const { virtualizer, ref } = useListVirtualizer({
    count: 0,
    estimatedSize: () => ROW_HEIGHT,
    overscan: 8,
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
          setExpanded((prev) => [...new Set([...prev, target])])
          break
      }

      const nextCollection = collection.move([sourcePath], toPath)
      setCollection(nextCollection)
    },
  })

  const dndApi = dnd.connect(dndService, normalizeProps)
  const dragSource = dndApi.dragSource

  const expandedValue = useMemo(() => {
    const base = query ? visibleCollection.getBranchValues() : expanded
    return getCollapsedExpandedValues(collection, base, dragSource)
  }, [collection, dragSource, expanded, query, visibleCollection])

  const treeService = useMachine(tree.machine, {
    id: treeId,
    collection: visibleCollection,
    expandedValue,
    scrollToIndexFn(details) {
      virtualizer.scrollToIndex(details.index, { align: "auto" })
    },
    onExpandedChange(details) {
      if (query) return
      setExpanded(details.expandedValue)
    },
  })

  const api = tree.connect(treeService, normalizeProps)
  const visibleNodes = api.getVisibleNodes()
  const visibleNodeCount = visibleNodes.length

  useEffect(() => {
    virtualizer.updateOptions({ count: visibleNodeCount })
  }, [virtualizer, visibleNodeCount])

  const virtualItems = virtualizer.getVirtualItems()
  const range = virtualizer.getRange()

  const draggedNode = dragSource ? collection.findNode(dragSource) : undefined
  const draggedIsBranch = draggedNode ? collection.isBranchNode(draggedNode) : false
  const draggedItemCount =
    draggedIsBranch && dragSource ? collection.getDescendantValues(dragSource, { withBranch: true }).length : undefined
  const dragPreviewProps = dndApi.getDragPreviewProps()

  return (
    <>
      <main>
        <div {...dndApi.getRootProps()} className={styles.root}>
          <div className={styles.header}>
            <div>
              <h2 {...api.getLabelProps()}>Virtualized Tree</h2>
              <p>Drag nodes to reorder or move items into folders. Folders collapse while dragging.</p>
            </div>
            <input
              value={query}
              onChange={(event) => setQuery(event.currentTarget.value)}
              placeholder="Filter visible nodes..."
              className={styles.searchInput}
            />
          </div>

          <div className={styles.stats}>
            <span>{visibleNodes.length} visible nodes</span>
            <span>mounted rows {visibleNodes.length ? `${range.startIndex + 1}-${range.endIndex + 1}` : "0"}</span>
            <span>drop {dndApi.dropTarget ? `${dndApi.dropTarget} ${dndApi.dropPlacement}` : "none"}</span>
          </div>

          <div ref={ref} onScroll={virtualizer.handleScroll} className={styles.viewport}>
            <div {...api.getTreeProps()} className={styles.sizer} style={{ height: virtualizer.getTotalSize() }}>
              {virtualItems.map((virtualItem: VirtualItem) => {
                const item = visibleNodes[virtualItem.index]
                if (!item) return null

                const isDropTarget = dndApi.dropTarget === item.node.id

                return (
                  <TreeNode
                    key={item.node.id}
                    api={api}
                    dndApi={dndApi}
                    node={item.node}
                    indexPath={item.indexPath}
                    style={{
                      ...virtualizer.getItemStyle(virtualItem),
                      height: virtualItem.size,
                      zIndex: isDropTarget ? 2 : undefined,
                      overflow: "visible",
                    }}
                  />
                )
              })}
            </div>
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={() => api.expand()}>
              Expand all
            </button>
            <button type="button" onClick={() => api.collapse()}>
              Collapse all
            </button>
          </div>

          {dndApi.isDragging && draggedNode && (
            <div
              {...dragPreviewProps}
              className={styles.dragPreview}
              style={{
                ...dragPreviewProps.style,
                width: "auto",
                height: "auto",
                transform: dragPreviewProps.style?.transform
                  ? `${dragPreviewProps.style.transform} translate(6px, -10px)`
                  : undefined,
              }}
            >
              <div className={styles.previewNode}>
                <NodeLabel isBranch={draggedIsBranch} name={draggedNode.name} itemCount={draggedItemCount} />
              </div>
            </div>
          )}
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={dndService} />
      </Toolbar>
    </>
  )
}
