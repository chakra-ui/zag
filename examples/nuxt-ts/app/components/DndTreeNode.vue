<script setup lang="ts">
import type * as dnd from "@zag-js/dnd"
import type * as tree from "@zag-js/tree-view"
import { mergeProps } from "@zag-js/vue"
import { ChevronRightIcon, FileIcon, FolderIcon, GripVertical } from "lucide-vue-next"
import styles from "@styles/dnd-tree.module.css"

interface Node {
  id: string
  name: string
  children?: Node[]
}

const props = defineProps<{
  node: Node
  indexPath: number[]
  treeApi: tree.Api
  dndApi: dnd.Api
}>()

const nodeProps = computed(() => ({ indexPath: props.indexPath, node: props.node }))
const nodeState = computed(() => props.treeApi.getNodeState(nodeProps.value))
</script>

<template>
  <div v-bind="treeApi.getNodeGroupProps(nodeProps)">
    <div
      v-bind="
        mergeProps(treeApi.getNodeProps(nodeProps), dndApi.getDropTargetProps({ value: node.id }), {
          class: styles.dropTarget,
        })
      "
    >
      <div
        v-bind="dndApi.getDropIndicatorProps({ value: node.id, placement: 'before' })"
        :class="styles.dropIndicator"
        :style="{ '--depth': nodeState.depth }"
      />

      <div v-bind="treeApi.getNodeCellProps(nodeProps)" :class="styles.cell">
        <span v-bind="dndApi.getDragHandleProps({ value: node.id })" :class="styles.dragHandle">
          <GripVertical :size="14" />
        </span>
        <span v-if="nodeState.isBranch" v-bind="treeApi.getNodeIndicatorProps({ ...nodeProps, type: 'expanded' })">
          <ChevronRightIcon :size="14" />
        </span>
        <FolderIcon v-if="nodeState.isBranch" :size="14" />
        <FileIcon v-else :size="14" />
        <span v-bind="treeApi.getNodeTextProps(nodeProps)">{{ node.name }}</span>
      </div>

      <div
        v-bind="dndApi.getDropIndicatorProps({ value: node.id, placement: 'after' })"
        :class="styles.dropIndicator"
        :style="{ '--depth': nodeState.depth }"
      />
    </div>

    <div v-if="nodeState.isBranch" v-bind="treeApi.getNodeGroupContentProps(nodeProps)">
      <div v-bind="treeApi.getIndentGuideProps(nodeProps)" />
      <DndTreeNode
        v-for="(childNode, index) in node.children"
        :key="childNode.id"
        :node="childNode"
        :index-path="[...indexPath, index]"
        :tree-api="treeApi"
        :dnd-api="dndApi"
      />
    </div>
  </div>
</template>
