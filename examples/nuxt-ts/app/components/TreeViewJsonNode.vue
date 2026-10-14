<script setup lang="ts">
import {
  type JsonNode,
  type JsonNodeHastElement,
  type JsonNodePreviewOptions,
  getAccessibleDescription,
  jsonNodeToElement,
  keyPathToKey,
  nodeToValue,
} from "@zag-js/json-tree-utils"
import type { Api } from "@zag-js/tree-view"
import { mergeProps } from "@zag-js/vue"
import { ChevronRightIcon } from "lucide-vue-next"
import { defineComponent, h, type PropType, type VNodeChild } from "vue"
import styles from "@styles/json-tree-view.module.css"

const props = defineProps<{
  api: Api
  indexPath: number[]
  node: JsonNode
  previewOptions: JsonNodePreviewOptions
}>()

const ValueNode = defineComponent({
  name: "JsonValueNode",
  props: { node: { type: Object as PropType<JsonNodeHastElement>, required: true } },
  setup(valueProps): () => VNodeChild {
    return () => {
      const node = valueProps.node
      if (node.type === "text") return node.value
      return h(
        node.tagName,
        {
          "data-root": node.properties.root ? "" : undefined,
          "data-type": node.properties.nodeType,
          "data-kind": node.properties.kind,
        },
        node.children.map((child, index) => h(ValueNode, { key: index, node: child })),
      )
    }
  },
})

const nodeProps = computed(() => ({ indexPath: props.indexPath, node: props.node }))
const nodeState = computed(() => props.api.getNodeState(nodeProps.value))
const key = computed(() => keyPathToKey(props.node.keyPath, { excludeRoot: true }))
const valueNode = computed(() => jsonNodeToElement(props.node, props.previewOptions))

const rowProps = computed(() =>
  mergeProps(props.api.getNodeProps(nodeProps.value), {
    "aria-label": getAccessibleDescription(props.node),
    class: styles.node,
    style: { "--depth": nodeState.value.depth },
  }),
)
</script>

<template>
  <div v-bind="api.getNodeGroupProps(nodeProps)" :class="styles.nodeGroup">
    <div v-bind="rowProps">
      <div v-bind="api.getNodeCellProps(nodeProps)" :class="styles.cell">
        <span
          v-if="nodeState.isBranch"
          v-bind="api.getNodeIndicatorProps({ ...nodeProps, type: 'expanded' })"
          :class="styles.chevron"
        >
          <ChevronRightIcon :size="14" />
        </span>
        <span v-else :class="styles.chevronSpacer" aria-hidden="true" />
        <template v-if="key">
          <span data-kind="key" :data-non-enumerable="node.isNonEnumerable ? '' : undefined">{{ key }}</span>
          <span data-kind="colon">: </span>
        </template>
        <ValueNode :node="valueNode" />
      </div>
    </div>
    <div v-if="nodeState.isBranch" v-bind="api.getNodeGroupContentProps(nodeProps)" :class="styles.groupContent">
      <div v-bind="api.getIndentGuideProps(nodeProps)" :class="styles.indentGuide" />
      <TreeViewJsonNode
        v-for="(child, index) in node.children"
        :key="nodeToValue(child)"
        :api="api"
        :node="child"
        :index-path="[...indexPath, index]"
        :preview-options="previewOptions"
      />
    </div>
  </div>
</template>
