import * as dnd from "@zag-js/dnd"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import * as tree from "@zag-js/tree-view"
import styles from "@styles/dnd-virtualized-tree.module.css"
import { ChevronRightIcon, FileIcon, FolderIcon } from "lucide-solid"
import {
  type Accessor,
  type JSX,
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  Index,
  Show,
  untrack,
} from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useListVirtualizer } from "~/hooks/use-virtualizer"

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
  return (
    <>
      <Show
        when={props.isBranch}
        fallback={
          <>
            <span class={styles.chevronSpacer} aria-hidden="true" />
            <FileIcon size={15} />
          </>
        }
      >
        <span class={styles.chevron}>
          <ChevronRightIcon size={14} />
        </span>
        <FolderIcon size={15} />
      </Show>
      <span class={styles.nodeText}>{props.name}</span>
      <Show when={props.isBranch && props.itemCount != null}>
        <span class={styles.previewCount}>
          {props.itemCount} {props.itemCount === 1 ? "item" : "items"}
        </span>
      </Show>
    </>
  )
}

interface TreeNodeProps {
  api: Accessor<tree.Api>
  dndApi: Accessor<dnd.Api>
  indexPath: number[]
  node: Node
  style: JSX.CSSProperties
}

function TreeNode(props: TreeNodeProps): JSX.Element {
  const { api, dndApi } = props
  const nodeProps = () => ({ node: props.node, indexPath: props.indexPath })
  const nodeState = createMemo(() => api().getNodeState(nodeProps()))
  const value = () => nodeState().value

  return (
    <div style={props.style}>
      <div class={styles.row}>
        <div
          {...dndApi().getDropIndicatorProps({ value: value(), placement: "before" })}
          class={styles.dropIndicator}
          style={{ "--depth": nodeState().depth }}
        />

        <div
          {...mergeProps(
            api().getNodeProps(nodeProps()),
            dndApi().getDraggableProps({ value: value() }),
            dndApi().getDropTargetProps({ value: value() }),
            {
              class: styles.node,
              style: { "--depth": nodeState().depth },
            },
          )}
        >
          <div {...api().getNodeCellProps(nodeProps())} class={styles.cell}>
            <Show
              when={nodeState().isBranch}
              fallback={
                <>
                  <span class={styles.chevronSpacer} aria-hidden="true" />
                  <FileIcon size={15} />
                </>
              }
            >
              <span {...api().getNodeIndicatorProps({ ...nodeProps(), type: "expanded" })} class={styles.chevron}>
                <ChevronRightIcon size={14} />
              </span>
              <FolderIcon size={15} />
            </Show>
            <span {...api().getNodeTextProps(nodeProps())} class={styles.nodeText}>
              {props.node.name}
            </span>
          </div>
        </div>

        <div
          {...dndApi().getDropIndicatorProps({ value: value(), placement: "after" })}
          class={styles.dropIndicator}
          style={{ "--depth": nodeState().depth }}
        />
      </div>
    </div>
  )
}

export default function Page() {
  const [collection, setCollection] = createSignal(createCollection(createRoot()))
  const [expanded, setExpanded] = createSignal<string[]>(["folder-0", "folder-1", "folder-2"])
  const [query, setQuery] = createSignal("")

  const treeId = createUniqueId()
  const dndId = createUniqueId()

  const visibleCollection = createMemo(() => {
    const normalized = query().trim().toLowerCase()
    if (!normalized) return collection()
    return collection().filter((node) => node.name.toLowerCase().includes(normalized))
  })

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
      return collection().stringify(value) ?? value
    },
    canDrop(source, target, placement) {
      const current = collection()
      if (source === target && placement === "on") return false
      const targetNode = current.findNode(target)
      if (placement === "on" && (!targetNode || !current.isBranchNode(targetNode))) return false
      const sourcePath = current.getIndexPath(source)
      const targetPath = current.getIndexPath(target)
      if (sourcePath && targetPath) {
        return !current.contains(sourcePath, targetPath)
      }
      return true
    },
    onDrop({ source, target, placement }) {
      const current = collection()
      const sourcePath = current.getIndexPath(source)
      const targetPath = current.getIndexPath(target)
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

      setCollection(current.move([sourcePath], toPath))
    },
  })

  const dndApi = createMemo(() => dnd.connect(dndService, normalizeProps))
  const dragSource = () => dndApi().dragSource

  const expandedValue = createMemo(() => {
    const base = query() ? visibleCollection().getBranchValues() : expanded()
    return getCollapsedExpandedValues(collection(), base, dragSource())
  })

  const treeService = useMachine(tree.machine as tree.Machine<Node>, (): tree.Props<Node> => ({
    id: treeId,
    collection: visibleCollection(),
    expandedValue: expandedValue(),
    scrollToIndexFn(details) {
      virtualizer.scrollToIndex(details.index, { align: "auto" })
    },
    onExpandedChange(details) {
      if (query()) return
      setExpanded(details.expandedValue)
    },
  }))

  const api = createMemo(() => tree.connect(treeService, normalizeProps))
  const visibleNodes = createMemo(() => api().getVisibleNodes())

  createEffect(() => {
    const count = visibleNodes().length
    untrack(() => virtualizer.updateOptions({ count }))
  })

  const range = () => virtualizer.getRange()

  const draggedNode = createMemo(() => {
    const source = dragSource()
    return source ? collection().findNode(source) : undefined
  })
  const draggedIsBranch = () => {
    const node = draggedNode()
    return node ? collection().isBranchNode(node) : false
  }
  const draggedItemCount = () => {
    const source = dragSource()
    return draggedIsBranch() && source
      ? collection().getDescendantValues(source, { withBranch: true }).length
      : undefined
  }

  const dragPreviewProps = () => {
    const props = dndApi().getDragPreviewProps()
    const style = props.style as JSX.CSSProperties | undefined
    return mergeProps(props, {
      class: styles.dragPreview,
      style: {
        width: "auto",
        height: "auto",
        transform: style?.transform ? `${style.transform} translate(6px, -10px)` : undefined,
      },
    })
  }

  return (
    <>
      <main>
        <div {...dndApi().getRootProps()} class={styles.root}>
          <div class={styles.header}>
            <div>
              <h2 {...api().getLabelProps()}>Virtualized Tree</h2>
              <p>Drag nodes to reorder or move items into folders. Folders collapse while dragging.</p>
            </div>
            <input
              value={query()}
              onInput={(event) => setQuery(event.currentTarget.value)}
              placeholder="Filter visible nodes..."
              class={styles.searchInput}
            />
          </div>

          <div class={styles.stats}>
            <span>{visibleNodes().length} visible nodes</span>
            <span>
              mounted rows {visibleNodes().length ? `${range().startIndex + 1}-${range().endIndex + 1}` : "0"}
            </span>
            <span>drop {dndApi().dropTarget ? `${dndApi().dropTarget} ${dndApi().dropPlacement}` : "none"}</span>
          </div>

          <div ref={ref} onScroll={virtualizer.handleScroll} class={styles.viewport}>
            <div
              {...mergeProps(api().getTreeProps(), {
                class: styles.sizer,
                style: { height: `${virtualizer.getTotalSize()}px` },
              })}
            >
              <Index each={virtualizer.getVirtualItems()}>
                {(virtualItem) => {
                  const item = () => visibleNodes()[virtualItem().index]
                  return (
                    <Show when={item()}>
                      {(item) => (
                        <TreeNode
                          api={api}
                          dndApi={dndApi}
                          node={item().node}
                          indexPath={item().indexPath}
                          style={{
                            ...virtualizer.getItemStyle(virtualItem()),
                            height: `${virtualItem().size}px`,
                            "z-index": dndApi().dropTarget === item().node.id ? 2 : undefined,
                            overflow: "visible",
                          }}
                        />
                      )}
                    </Show>
                  )
                }}
              </Index>
            </div>
          </div>

          <div class={styles.actions}>
            <button type="button" onClick={() => api().expand()}>
              Expand all
            </button>
            <button type="button" onClick={() => api().collapse()}>
              Collapse all
            </button>
          </div>

          <Show when={dndApi().isDragging && draggedNode()}>
            {(node) => (
              <div {...dragPreviewProps()}>
                <div class={styles.previewNode}>
                  <NodeLabel isBranch={draggedIsBranch()} name={node().name} itemCount={draggedItemCount()} />
                </div>
              </div>
            )}
          </Show>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={dndService} />
      </Toolbar>
    </>
  )
}
