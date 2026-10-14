<script lang="ts" setup>
import * as dnd from "@zag-js/dnd"
import * as tree from "@zag-js/tree-view"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"
import { ChevronRightIcon, FileIcon, FolderIcon } from "lucide-vue-next"
import { useListVirtualizer } from "~/composables/useVirtualizer"
import styles from "@styles/dnd-virtualized-tree.module.css"

interface Node {
  id: string
  name: string
  children?: Node[]
}

const ROW_HEIGHT = 32
const estimateSize = () => ROW_HEIGHT

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

const collection = shallowRef(createCollection(createRoot()))
const expanded = ref<string[]>(["folder-0", "folder-1", "folder-2"])
const query = ref("")

const treeId = useId()
const dndId = useId()

const visibleCollection = computed(() => {
  const normalized = query.value.trim().toLowerCase()
  if (!normalized) return collection.value
  return collection.value.filter((node) => node.name.toLowerCase().includes(normalized))
})

const dndService = useMachine(dnd.machine, {
  id: dndId,
  orientation: "vertical",
  dropPlacements: ["before", "after", "on"],
  activationConstraint: { distance: 6 },
  scrollThreshold: 36,
  scrollMaxSpeed: 12,
  getValueText(value) {
    return collection.value.stringify(value) ?? value
  },
  canDrop(source, target, placement) {
    const c = collection.value
    if (source === target && placement === "on") return false
    const targetNode = c.findNode(target)
    if (placement === "on" && (!targetNode || !c.isBranchNode(targetNode))) return false
    const sourcePath = c.getIndexPath(source)
    const targetPath = c.getIndexPath(target)
    if (sourcePath && targetPath) {
      return !c.contains(sourcePath, targetPath)
    }
    return true
  },
  onDrop({ source, target, placement }) {
    const sourcePath = collection.value.getIndexPath(source)
    const targetPath = collection.value.getIndexPath(target)
    if (!sourcePath || !targetPath) return

    let toPath: number[]
    switch (placement) {
      case "before":
        toPath = targetPath
        break
      case "after":
        toPath = [...targetPath.slice(0, -1), (targetPath[targetPath.length - 1] ?? 0) + 1]
        break
      case "on":
        toPath = [...targetPath, 0]
        expanded.value = [...new Set([...expanded.value, target])]
        break
    }

    collection.value = collection.value.move([sourcePath], toPath)
  },
})

const dndApi = computed(() => dnd.connect(dndService, normalizeProps))
const dragSource = computed(() => dndApi.value.dragSource)

const expandedValue = computed(() => {
  const base = query.value ? visibleCollection.value.getBranchValues() : expanded.value
  return getCollapsedExpandedValues(collection.value, base, dragSource.value)
})

const treeService = useMachine(
  tree.machine,
  computed<tree.Props>(() => ({
    id: treeId,
    collection: visibleCollection.value,
    expandedValue: expandedValue.value,
    scrollToIndexFn(details) {
      virtualizer.scrollToIndex(details.index, { align: "auto" })
    },
    onExpandedChange(details) {
      if (query.value) return
      expanded.value = details.expandedValue
    },
  })),
)

const api = computed(() => tree.connect(treeService, normalizeProps))
const visibleNodes = computed(() => api.value.getVisibleNodes())

const { virtualizer, init } = useListVirtualizer(() => ({
  count: visibleNodes.value.length,
  estimatedSize: estimateSize,
  overscan: 8,
}))

const range = computed(() => virtualizer.getRange())

const rows = computed(() =>
  virtualizer.getVirtualItems().flatMap((virtualItem) => {
    const item = visibleNodes.value[virtualItem.index]
    if (!item) return []
    const nodeProps = { node: item.node as Node, indexPath: item.indexPath }
    const nodeState = api.value.getNodeState(nodeProps)
    return [
      {
        key: item.node.id,
        node: item.node as Node,
        nodeProps,
        nodeState,
        style: {
          ...virtualizer.getItemStyle(virtualItem),
          height: `${virtualItem.size}px`,
          zIndex: dndApi.value.dropTarget === item.node.id ? 2 : undefined,
          overflow: "visible",
        },
      },
    ]
  }),
)

const draggedNode = computed(() => (dragSource.value ? collection.value.findNode(dragSource.value) : undefined))
const draggedIsBranch = computed(() => (draggedNode.value ? collection.value.isBranchNode(draggedNode.value) : false))
const draggedItemCount = computed(() =>
  draggedIsBranch.value && dragSource.value
    ? collection.value.getDescendantValues(dragSource.value, { withBranch: true }).length
    : undefined,
)

const dragPreviewProps = computed(() => {
  const props = dndApi.value.getDragPreviewProps()
  const style = (props.style ?? {}) as Record<string, any>
  return {
    ...props,
    style: {
      ...style,
      width: "auto",
      height: "auto",
      transform: style.transform ? `${style.transform} translate(6px, -10px)` : undefined,
    },
  }
})
</script>

<template>
  <main>
    <div v-bind="dndApi.getRootProps()" :class="styles.root">
      <div :class="styles.header">
        <div>
          <h2 v-bind="api.getLabelProps()">Virtualized Tree</h2>
          <p>Drag nodes to reorder or move items into folders. Folders collapse while dragging.</p>
        </div>
        <input v-model="query" placeholder="Filter visible nodes..." :class="styles.searchInput" />
      </div>

      <div :class="styles.stats">
        <span>{{ visibleNodes.length }} visible nodes</span>
        <span>mounted rows {{ visibleNodes.length ? `${range.startIndex + 1}-${range.endIndex + 1}` : "0" }}</span>
        <span>drop {{ dndApi.dropTarget ? `${dndApi.dropTarget} ${dndApi.dropPlacement}` : "none" }}</span>
      </div>

      <div :ref="(el) => init(el as HTMLElement)" :class="styles.viewport" @scroll="virtualizer.handleScroll">
        <div v-bind="api.getTreeProps()" :class="styles.sizer" :style="{ height: `${virtualizer.getTotalSize()}px` }">
          <div v-for="row in rows" :key="row.key" :style="row.style">
            <div :class="styles.row">
              <div
                v-bind="dndApi.getDropIndicatorProps({ value: row.nodeState.value, placement: 'before' })"
                :class="styles.dropIndicator"
                :style="{ '--depth': row.nodeState.depth }"
              />

              <div
                v-bind="
                  mergeProps(
                    api.getNodeProps(row.nodeProps),
                    dndApi.getDraggableProps({ value: row.nodeState.value }),
                    dndApi.getDropTargetProps({ value: row.nodeState.value }),
                    { class: styles.node, style: { '--depth': row.nodeState.depth } },
                  )
                "
              >
                <div v-bind="api.getNodeCellProps(row.nodeProps)" :class="styles.cell">
                  <template v-if="row.nodeState.isBranch">
                    <span
                      v-bind="api.getNodeIndicatorProps({ ...row.nodeProps, type: 'expanded' })"
                      :class="styles.chevron"
                    >
                      <ChevronRightIcon :size="14" />
                    </span>
                    <FolderIcon :size="15" />
                  </template>
                  <template v-else>
                    <span :class="styles.chevronSpacer" aria-hidden="true" />
                    <FileIcon :size="15" />
                  </template>
                  <span v-bind="api.getNodeTextProps(row.nodeProps)" :class="styles.nodeText">{{ row.node.name }}</span>
                </div>
              </div>

              <div
                v-bind="dndApi.getDropIndicatorProps({ value: row.nodeState.value, placement: 'after' })"
                :class="styles.dropIndicator"
                :style="{ '--depth': row.nodeState.depth }"
              />
            </div>
          </div>
        </div>
      </div>

      <div :class="styles.actions">
        <button type="button" @click="api.expand()">Expand all</button>
        <button type="button" @click="api.collapse()">Collapse all</button>
      </div>

      <div v-if="dndApi.isDragging && draggedNode" v-bind="dragPreviewProps" :class="styles.dragPreview">
        <div :class="styles.previewNode">
          <template v-if="draggedIsBranch">
            <span :class="styles.chevron">
              <ChevronRightIcon :size="14" />
            </span>
            <FolderIcon :size="15" />
          </template>
          <template v-else>
            <span :class="styles.chevronSpacer" aria-hidden="true" />
            <FileIcon :size="15" />
          </template>
          <span :class="styles.nodeText">{{ draggedNode.name }}</span>
          <span v-if="draggedIsBranch && draggedItemCount != null" :class="styles.previewCount">
            {{ draggedItemCount }} {{ draggedItemCount === 1 ? "item" : "items" }}
          </span>
        </div>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="dndService" />
  </Toolbar>
</template>
