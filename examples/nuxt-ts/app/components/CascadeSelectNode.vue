<script setup lang="ts">
import type { Api } from "@zag-js/cascade-select"
import type { TreeCollection } from "@zag-js/collection"

interface Node {
  label: string
  value: string
  continents?: Node[]
  countries?: Node[]
  code?: string
  states?: Node[]
}

interface TreeNodeProps {
  node: Node
  indexPath: number[]
  value: string[]
  api: Api
  collection: TreeCollection<Node>
}

const props = defineProps<TreeNodeProps>()

const nodeProps = computed(() => ({
  indexPath: props.indexPath,
  value: props.value,
  item: props.node,
}))

const nodeState = computed(() => props.api.getItemState(nodeProps.value))
const children = computed(() => props.collection.getNodeChildren(props.node))
</script>

<template>
  <ul v-bind="api.getListProps(nodeProps)">
    <li
      v-for="(item, index) in children"
      :key="item.label"
      v-bind="
        api.getItemProps({
          indexPath: [...indexPath, index],
          value: [...value, collection.getNodeValue(item)],
          item,
        })
      "
    >
      <span
        v-bind="
          api.getItemTextProps({
            indexPath: [...indexPath, index],
            value: [...value, collection.getNodeValue(item)],
            item,
          })
        "
        >{{ item.label }}</span
      >
      <span
        v-bind="
          api.getItemIndicatorProps({
            indexPath: [...indexPath, index],
            value: [...value, collection.getNodeValue(item)],
            item,
          })
        "
        >✓</span
      >
      <span
        v-if="
          api.getItemState({
            indexPath: [...indexPath, index],
            value: [...value, collection.getNodeValue(item)],
            item,
          }).hasChildren
        "
        >&gt;</span
      >
    </li>
  </ul>
  <CascadeSelectNode
    v-if="nodeState.highlightedChild && collection.isBranchNode(nodeState.highlightedChild)"
    :node="nodeState.highlightedChild"
    :api="api"
    :collection="collection"
    :index-path="[...indexPath, nodeState.highlightedIndex]"
    :value="[...value, collection.getNodeValue(nodeState.highlightedChild)]"
  />
</template>
