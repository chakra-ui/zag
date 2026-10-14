<script setup lang="ts">
import * as tree from "@zag-js/tree-view"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/tree-view.css"

interface Node {
  id: string
  name: string
  children?: Node[]
  childrenCount?: number
}

const apiResult = {
  node_modules: [
    { id: "zag-js", name: "zag-js" },
    { id: "pandacss", name: "panda" },
    { id: "@types", name: "@types", childrenCount: 2 },
  ],
  "node_modules/@types": [
    { id: "@types/react", name: "react" },
    { id: "@types/react-dom", name: "react-dom" },
  ],
  src: [
    { id: "src/app.tsx", name: "app.tsx" },
    { id: "src/index.ts", name: "index.ts" },
  ],
}

function loadChildren(details: tree.LoadChildrenDetails<Node>): Promise<Node[]> {
  const value = details.valuePath.join("/")
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(apiResult[value as keyof typeof apiResult] ?? [])
    }, 1200)
  })
}

const initCollection = tree.collection<Node>({
  nodeToValue: (node) => node.id,
  nodeToString: (node) => node.name,
  rootNode: {
    id: "ROOT",
    name: "",
    children: [
      { id: "node_modules", name: "node_modules", childrenCount: 3 },
      { id: "src", name: "src", childrenCount: 2 },
      { id: "panda.config", name: "panda.config.ts" },
      { id: "package.json", name: "package.json" },
      { id: "renovate.json", name: "renovate.json" },
      { id: "readme.md", name: "README.md" },
    ],
  },
})

const collection = shallowRef(initCollection)
const id = useId()

const service = useMachine(
  tree.machine as tree.Machine<Node>,
  computed(() => ({
    id,
    collection: collection.value,
    loadChildren,
    onLoadChildrenComplete(details: tree.LoadChildrenCompleteDetails<Node>) {
      collection.value = details.collection
    },
  })),
)

const api = computed(() => tree.connect(service, normalizeProps))
</script>

<template>
  <main class="tree-view">
    <div v-bind="api.getRootProps()">
      <h3 v-bind="api.getLabelProps()">My Documents</h3>
      <div style="display: flex; gap: 10px">
        <button @click="api.collapse()">Collapse All</button>
        <button @click="api.expand()">Expand All</button>
        <button @click="api.expand(['node_modules'])">Expand node_modules</button>
        <button @click="api.collapse(['node_modules'])">Collapse node_modules</button>
      </div>
      <div v-bind="api.getTreeProps()">
        <TreeViewAsyncNode
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
