<script setup lang="ts">
import type { Api } from "@zag-js/tree-view"
import { ChevronRightIcon, ExternalLinkIcon, FileIcon, FolderIcon } from "lucide-vue-next"

interface Node {
  id: string
  name: string
  href?: string
  children?: Node[]
}

const props = defineProps<{ node: Node; indexPath: number[]; api: Api }>()

const nodeProps = computed(() => ({ indexPath: props.indexPath, node: props.node }))
const nodeState = computed(() => props.api.getNodeState(nodeProps.value))
</script>

<template>
  <div v-bind="api.getNodeGroupProps(nodeProps)">
    <div v-bind="api.getNodeProps(nodeProps)">
      <div v-bind="api.getNodeCellProps(nodeProps)">
        <FolderIcon v-if="nodeState.isBranch" />
        <FileIcon v-else />
        <span v-bind="api.getNodeTextProps(nodeProps)">
          <a v-if="node.href" :href="node.href">
            {{ node.name }}
            <ExternalLinkIcon v-if="node.href.startsWith('http')" :size="12" />
          </a>
          <template v-else>{{ node.name }}</template>
        </span>
        <span v-if="nodeState.isBranch" v-bind="api.getNodeIndicatorProps({ ...nodeProps, type: 'expanded' })">
          <ChevronRightIcon />
        </span>
      </div>
    </div>
    <div v-if="nodeState.isBranch" v-bind="api.getNodeGroupContentProps(nodeProps)">
      <div v-bind="api.getIndentGuideProps(nodeProps)" />
      <TreeViewLinkNode
        v-for="(childNode, index) in node.children"
        :key="childNode.id"
        :node="childNode"
        :index-path="[...indexPath, index]"
        :api="api"
      />
    </div>
  </div>
</template>
