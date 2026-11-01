<script setup lang="ts">
import { treeviewControls } from "@zag-js/shared"
import * as tree from "@zag-js/tree-view"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { ChevronRightIcon, FileIcon, FolderIcon } from "lucide-vue-next"
import { useListVirtualizer } from "~/composables/useVirtualizer"
import "@styles/tree-view.css"

interface Node {
  id: string
  name: string
  children?: Node[]
}

const ROW_HEIGHT = 32
const estimateSize = () => ROW_HEIGHT

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

const service = useMachine(
  tree.machine,
  controls.mergeProps<tree.Props>({
    id: useId(),
    collection,
    scrollToIndexFn(details) {
      virtualizer.scrollToIndex(details.index, { align: "auto" })
    },
  }),
)

const api = computed(() => tree.connect(service, normalizeProps))
const visibleNodes = computed(() => api.value.getVisibleNodes())

const { virtualizer, init } = useListVirtualizer(() => ({
  count: visibleNodes.value.length,
  estimatedSize: estimateSize,
  overscan: 10,
}))

const rows = computed(() =>
  virtualizer.getVirtualItems().flatMap((vi) => {
    const visible = visibleNodes.value[vi.index]
    if (!visible) return []
    const nodeProps = { node: visible.node, indexPath: visible.indexPath }
    return [{ vi, nodeProps, nodeState: api.value.getNodeState(nodeProps) }]
  }),
)
</script>

<template>
  <main class="tree-view">
    <div v-bind="api.getRootProps()">
      <h3 v-bind="api.getLabelProps()">Virtualized Tree ({{ visibleNodes.length }} visible nodes)</h3>
      <div style="display: flex; gap: 10px; margin-bottom: 10px">
        <button @click="api.collapse()">Collapse All</button>
        <button @click="api.expand()">Expand All</button>
        <template v-if="controls.context.value.selectionMode === 'multiple'">
          <button @click="api.select()">Select All</button>
          <button @click="api.deselect()">Deselect All</button>
        </template>
      </div>

      <div
        :ref="(el) => init(el as HTMLElement)"
        v-bind="api.getTreeProps()"
        style="height: 400px; overflow: auto; border: 1px solid #ccc; border-radius: 4px"
        @scroll="virtualizer.handleScroll"
      >
        <div :style="{ height: `${virtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }">
          <div
            v-for="{ vi, nodeProps, nodeState } in rows"
            :key="nodeProps.node.id"
            :data-index="vi.index"
            :style="virtualizer.getItemStyle(vi)"
          >
            <div
              v-bind="api.getNodeProps(nodeProps)"
              :style="{
                paddingLeft: `${nodeState.depth * 20}px`,
                height: `${ROW_HEIGHT}px`,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }"
            >
              <div v-bind="api.getNodeCellProps(nodeProps)">
                <span v-if="nodeState.isBranch" v-bind="api.getNodeIndicatorProps({ ...nodeProps, type: 'expanded' })">
                  <ChevronRightIcon :size="16" />
                </span>
                <FolderIcon v-if="nodeState.isBranch" :size="16" />
                <FileIcon v-else :size="16" />
                <span v-bind="api.getNodeTextProps(nodeProps)">{{ nodeProps.node.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" :omit="['collection']" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
