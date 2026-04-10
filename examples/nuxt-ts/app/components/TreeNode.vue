<script setup lang="ts">
import type { Api } from "@zag-js/tree-view"
import { ChevronRightIcon, FileIcon, FolderIcon } from "lucide-vue-next"

interface Node {
  id: string
  name: string
  children?: Node[]
}

interface Props {
  node: Node
  indexPath: number[]
  api: Api
}

const props = defineProps<Props>()

const nodeProps = computed(() => ({
  indexPath: props.indexPath,
  node: props.node,
}))

const nodeState = computed(() => props.api.getNodeState(nodeProps.value))
</script>

<template>
  <div v-bind="api.getNodeGroupProps(nodeProps)">
    <div v-bind="api.getNodeProps(nodeProps)">
      <div v-bind="api.getCellProps({ ...nodeProps, cell: 'content' })">
        <FolderIcon v-if="nodeState.isBranch" />
        <FileIcon v-else />
        <span v-bind="api.getNodeTextProps(nodeProps)">{{ node.name }}</span>
        <span v-if="nodeState.isBranch" v-bind="api.getNodeIndicatorProps({ ...nodeProps, type: 'expanded' })">
          <ChevronRightIcon />
        </span>
      </div>
    </div>
    <div v-if="nodeState.isBranch" v-bind="api.getNodeGroupContentProps(nodeProps)">
      <div v-bind="api.getIndentGuideProps(nodeProps)" />
      <TreeNode
        v-for="(childNode, index) in node.children"
        :key="childNode.id"
        :node="childNode"
        :index-path="[...indexPath, index]"
        :api="api"
      />
    </div>
  </div>
</template>
