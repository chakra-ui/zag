<script setup lang="ts">
import type { Api as MenuApi } from "@zag-js/menu"
import type { Api } from "@zag-js/tree-view"
import { ChevronRightIcon, FileIcon, FolderIcon, MoreVerticalIcon } from "lucide-vue-next"

interface Node {
  id: string
  name: string
  children?: Node[]
}

const props = defineProps<{ node: Node; indexPath: number[]; treeApi: Api; menuApi: MenuApi }>()

const nodeProps = computed(() => ({ indexPath: props.indexPath, node: props.node }))
const nodeState = computed(() => props.treeApi.getNodeState(nodeProps.value))
</script>

<template>
  <div v-bind="treeApi.getNodeGroupProps(nodeProps)">
    <div v-bind="treeApi.getNodeProps(nodeProps)">
      <div v-bind="treeApi.getNodeCellProps(nodeProps)">
        <FolderIcon v-if="nodeState.isBranch" />
        <FileIcon v-else />
        <span v-bind="treeApi.getNodeTextProps(nodeProps)">{{ node.name }}</span>
        <span v-if="nodeState.isBranch" v-bind="treeApi.getNodeIndicatorProps({ ...nodeProps, type: 'expanded' })">
          <ChevronRightIcon />
        </span>
      </div>
      <div v-bind="treeApi.getNodeCellProps(nodeProps)">
        <button
          v-bind="menuApi.getTriggerProps({ value: nodeState.value })"
          style="background: none; border: none; cursor: pointer; padding: 2px"
        >
          <MoreVerticalIcon :size="14" />
        </button>
      </div>
    </div>
    <div v-if="nodeState.isBranch" v-bind="treeApi.getNodeGroupContentProps(nodeProps)">
      <div v-bind="treeApi.getIndentGuideProps(nodeProps)" />
      <TreeViewActionsNode
        v-for="(childNode, index) in node.children"
        :key="childNode.id"
        :node="childNode"
        :index-path="[...indexPath, index]"
        :tree-api="treeApi"
        :menu-api="menuApi"
      />
    </div>
  </div>
</template>
