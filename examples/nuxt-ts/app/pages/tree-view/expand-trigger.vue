<script setup lang="ts">
import * as tree from "@zag-js/tree-view"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/tree-view.css"

interface Node {
  id: string
  name: string
  children?: Node[]
}

const collection = tree.collection<Node>({
  nodeToValue: (node) => node.id,
  nodeToString: (node) => node.name,
  rootNode: {
    id: "ROOT",
    name: "",
    children: [
      {
        id: "node_modules",
        name: "node_modules",
        children: [
          { id: "node_modules/zag-js", name: "zag-js" },
          { id: "node_modules/pandacss", name: "panda" },
          {
            id: "node_modules/@types",
            name: "@types",
            children: [
              { id: "node_modules/@types/react", name: "react" },
              { id: "node_modules/@types/react-dom", name: "react-dom" },
            ],
          },
        ],
      },
      {
        id: "src",
        name: "src",
        children: [
          { id: "src/app.tsx", name: "app.tsx" },
          { id: "src/index.ts", name: "index.ts" },
        ],
      },
      { id: "panda.config", name: "panda.config.ts" },
      { id: "package.json", name: "package.json" },
      { id: "renovate.json", name: "renovate.json" },
      { id: "readme.md", name: "README.md" },
    ],
  },
})

const service = useMachine(tree.machine, { id: useId(), collection, expandOnClick: false })
const api = computed(() => tree.connect(service, normalizeProps))
</script>

<template>
  <main class="tree-view">
    <div v-bind="api.getRootProps()">
      <h3 v-bind="api.getLabelProps()">My Documents</h3>
      <p style="font-size: 14px; color: #666; margin-bottom: 10px">
        Clicking a row only selects it. Use the chevron button to expand/collapse.
      </p>
      <div style="display: flex; gap: 10px">
        <button @click="api.collapse()">Collapse All</button>
        <button @click="api.expand()">Expand All</button>
      </div>
      <div v-bind="api.getTreeProps()">
        <TreeViewExpandTriggerNode
          v-for="(node, index) in collection.rootNode.children"
          :key="node.id"
          :node="node"
          :index-path="[index]"
          :api="api"
        />
      </div>
    </div>
  </main>
</template>
