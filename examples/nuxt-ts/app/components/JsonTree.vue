<script setup lang="ts">
import type { TreeCollection } from "@zag-js/collection"
import {
  type JsonNode,
  type JsonNodePreviewOptions,
  getPreviewOptions,
  getRootNode,
  nodeToString,
  nodeToValue,
} from "@zag-js/json-tree-utils"
import * as tree from "@zag-js/tree-view"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"
import styles from "@styles/json-tree-view.module.css"

const DEFAULT_EXPANDED_DEPTH = 2

const props = defineProps<{
  data: unknown
  label: string
  hint: string
  options?: Partial<JsonNodePreviewOptions>
}>()

function getBranchValues(collection: TreeCollection<JsonNode>, depth: number) {
  const values: string[] = []
  collection.visit({
    onEnter: (node, indexPath) => {
      if (indexPath.length === 0) return
      if (collection.isBranchNode(node) && indexPath.length <= depth) {
        values.push(collection.getNodeValue(node))
      }
    },
  })
  return values
}

const previewOptions = getPreviewOptions(props.options)

const collection = tree.collection<JsonNode>({
  nodeToValue,
  nodeToString,
  rootNode: getRootNode(props.data, previewOptions),
})

const service = useMachine(tree.machine, {
  id: useId(),
  collection,
  defaultExpandedValue: getBranchValues(collection, DEFAULT_EXPANDED_DEPTH),
  typeahead: false,
})

const api = computed(() => tree.connect(service, normalizeProps))
const treeProps = computed(() =>
  mergeProps(api.value.getTreeProps(), { "aria-label": props.label, "aria-labelledby": undefined }),
)
</script>

<template>
  <div v-bind="api.getRootProps()" :class="styles.root">
    <p :class="styles.hint">{{ hint }}</p>

    <div :class="styles.toolbar">
      <button type="button" :class="styles.button" @click="api.collapse()">Collapse all</button>
      <button type="button" :class="styles.button" @click="api.expand()">Expand all</button>
    </div>

    <div :class="styles.panel">
      <div :class="styles.viewport">
        <div v-bind="treeProps" :class="styles.tree">
          <TreeViewJsonNode
            v-for="(node, index) in collection.rootNode.children"
            :key="nodeToValue(node)"
            :api="api"
            :node="node"
            :index-path="[index]"
            :preview-options="previewOptions"
          />
        </div>
      </div>
    </div>
  </div>

  <Toolbar>
    <StateVisualizer :state="service" :omit="['collection']" />
  </Toolbar>
</template>
