<script setup lang="ts">
import type { TreeCollection } from "@zag-js/collection"
import { type JsonNode, getPreviewOptions, getRootNode, nodeToString, nodeToValue } from "@zag-js/json-tree-utils"
import { jsonTreeData } from "@zag-js/shared"
import * as tree from "@zag-js/tree-view"
import { normalizeProps, useMachine } from "@zag-js/vue"
import styles from "@styles/json-tree-view.module.css"

const DEFAULT_EXPANDED_DEPTH = 2

const previewOptions = getPreviewOptions()

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

const collection = tree.collection<JsonNode>({
  nodeToValue,
  nodeToString,
  rootNode: getRootNode(jsonTreeData, previewOptions),
})

const service = useMachine(tree.machine, {
  id: useId(),
  collection,
  defaultExpandedValue: getBranchValues(collection, DEFAULT_EXPANDED_DEPTH),
  typeahead: false,
})

const api = computed(() => tree.connect(service, normalizeProps))
</script>

<template>
  <main :class="styles.root">
    <div v-bind="api.getRootProps()">
      <div :class="styles.header">
        <h3 v-bind="api.getLabelProps()">JSON Tree</h3>
        <p>Tree view wired to <code>@zag-js/json-tree-utils</code> for parsing, previews, and accessible labels.</p>
      </div>

      <div :class="styles.toolbar">
        <button type="button" :class="styles.button" @click="api.collapse()">Collapse all</button>
        <button type="button" :class="styles.button" @click="api.expand()">Expand all</button>
      </div>

      <div :class="styles.panel">
        <div :class="styles.viewport">
          <div v-bind="api.getTreeProps()" :class="styles.tree">
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
  </main>

  <Toolbar>
    <StateVisualizer :state="service" :omit="['collection']" />
  </Toolbar>
</template>
