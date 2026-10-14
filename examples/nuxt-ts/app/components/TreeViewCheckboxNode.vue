<script setup lang="ts">
import type { Api } from "@zag-js/tree-view"
import { CheckSquare, ChevronRightIcon, MinusSquare, Square } from "lucide-vue-next"

interface Node {
  id: string
  name: string
  children?: Node[]
}

const props = defineProps<{
  node: Node
  indexPath: number[]
  api: Api
  // Spread checkbox props onto the icon itself instead of a wrapping span
  bare?: boolean
}>()

const iconMap = {
  true: CheckSquare,
  false: Square,
  indeterminate: MinusSquare,
}

const nodeProps = computed(() => ({ indexPath: props.indexPath, node: props.node }))
const nodeState = computed(() => props.api.getNodeState(nodeProps.value))
const checkboxIcon = computed(() => iconMap[nodeState.value.checked.toString() as keyof typeof iconMap])
</script>

<template>
  <div v-bind="api.getNodeGroupProps(nodeProps)">
    <div v-bind="api.getNodeProps(nodeProps)">
      <div v-bind="api.getNodeCellProps(nodeProps)">
        <span v-if="nodeState.isBranch" v-bind="api.getNodeIndicatorProps({ ...nodeProps, type: 'expanded' })">
          <ChevronRightIcon />
        </span>
        <component :is="checkboxIcon" v-if="bare" v-bind="api.getNodeCheckboxProps(nodeProps)" />
        <span v-else v-bind="api.getNodeCheckboxProps(nodeProps)">
          <component :is="checkboxIcon" />
        </span>
      </div>
      <div v-bind="api.getNodeCellProps(nodeProps)">
        <span v-bind="api.getNodeTextProps(nodeProps)">{{ node.name }}</span>
      </div>
    </div>
    <div v-if="nodeState.isBranch" v-bind="api.getNodeGroupContentProps(nodeProps)">
      <div v-bind="api.getIndentGuideProps(nodeProps)" />
      <TreeViewCheckboxNode
        v-for="(childNode, index) in node.children"
        :key="childNode.id"
        :node="childNode"
        :index-path="[...indexPath, index]"
        :api="api"
        :bare="bare"
      />
    </div>
  </div>
</template>
