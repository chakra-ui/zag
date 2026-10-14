<script setup lang="ts">
import type { Api } from "@zag-js/tree-view"
import { mergeProps } from "@zag-js/vue"
import { ChevronRightIcon, FileIcon, FolderIcon } from "lucide-vue-next"
import styles from "@styles/tree-view-combobox-filter.module.css"

interface Node {
  id: string
  name: string
  children?: Node[]
}

const props = defineProps<{ node: Node; indexPath: number[]; api: Api }>()

const nodeProps = computed(() => ({ indexPath: props.indexPath, node: props.node }))
const nodeState = computed(() => props.api.getNodeState(nodeProps.value))
</script>

<template>
  <div v-bind="api.getNodeGroupProps(nodeProps)">
    <div v-bind="mergeProps(api.getNodeProps(nodeProps), { class: styles.node })">
      <div v-bind="api.getNodeCellProps(nodeProps)" :class="styles.cell">
        <template v-if="nodeState.isBranch">
          <span v-bind="api.getNodeIndicatorProps({ ...nodeProps, type: 'expanded' })" :class="styles.chevron">
            <ChevronRightIcon :size="14" />
          </span>
          <FolderIcon :size="15" />
        </template>
        <template v-else>
          <span :class="styles.chevron" aria-hidden="true" style="visibility: hidden">
            <ChevronRightIcon :size="14" />
          </span>
          <FileIcon :size="15" />
        </template>
        <span v-bind="api.getNodeTextProps(nodeProps)">{{ node.name }}</span>
      </div>
    </div>
    <div v-if="nodeState.isBranch" v-bind="api.getNodeGroupContentProps(nodeProps)" :class="styles.groupContent">
      <div v-bind="api.getIndentGuideProps(nodeProps)" :class="styles.indentGuide" />
      <TreeViewComboboxNode
        v-for="(childNode, index) in node.children"
        :key="childNode.id"
        :node="childNode"
        :index-path="[...indexPath, index]"
        :api="api"
      />
    </div>
  </div>
</template>
