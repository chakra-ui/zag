<script setup lang="ts">
import type { Api } from "@zag-js/tree-view"
import { ChevronRightIcon, FileIcon, FolderIcon } from "lucide-vue-next"

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
    <div v-bind="api.getNodeProps(nodeProps)">
      <div v-if="nodeState.isBranch" v-bind="api.getNodeCellProps(nodeProps)">
        <button v-bind="api.getNodeExpandTriggerProps(nodeProps)">
          <ChevronRightIcon />
        </button>
      </div>
      <div v-bind="api.getNodeCellProps(nodeProps)">
        <FolderIcon v-if="nodeState.isBranch" />
        <FileIcon v-else />
        <span v-bind="api.getNodeTextProps(nodeProps)">{{ node.name }}</span>
      </div>
    </div>
    <div v-if="nodeState.isBranch" v-bind="api.getNodeGroupContentProps(nodeProps)">
      <div v-bind="api.getIndentGuideProps(nodeProps)" />
      <TreeViewExpandTriggerNode
        v-for="(childNode, index) in node.children"
        :key="childNode.id"
        :node="childNode"
        :index-path="[...indexPath, index]"
        :api="api"
      />
    </div>
  </div>
</template>
