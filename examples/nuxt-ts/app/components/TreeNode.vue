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
  <template v-if="nodeState.isBranch">
    <div v-bind="api.getBranchProps(nodeProps)">
      <div v-bind="api.getBranchControlProps(nodeProps)">
        <FolderIcon />
        <span v-bind="api.getBranchTextProps(nodeProps)">{{ node.name }}</span>
        <span v-bind="api.getBranchIndicatorProps(nodeProps)">
          <ChevronRightIcon />
        </span>
      </div>
      <div v-bind="api.getBranchContentProps(nodeProps)">
        <div v-bind="api.getBranchIndentGuideProps(nodeProps)" />
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
  <template v-else>
    <div v-bind="api.getItemProps(nodeProps)"><FileIcon /> {{ node.name }}</div>
  </template>
</template>
