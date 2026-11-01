<script setup lang="ts">
import * as tree from "@zag-js/tree-view"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/tree-view.css"

interface Node {
  id: string
  name: string
  children?: Node[]
}

const initialCollection = tree.collection<Node>({
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

const collection = shallowRef(initialCollection)
const id = useId()

const service = useMachine(
  tree.machine,
  computed(() => ({ id, collection: collection.value })),
)
const api = computed(() => tree.connect(service, normalizeProps))

const onSearch = (event: Event) => {
  const value = (event.target as HTMLInputElement).value
  if (value.length === 0) {
    collection.value = initialCollection
  } else {
    const filtered = initialCollection.filter((node) => node.name.includes(value))
    collection.value = filtered
    api.value.setExpandedValue(filtered.getBranchValues())
  }
}
</script>

<template>
  <main class="tree-view">
    <div v-bind="api.getRootProps()">
      <input type="text" class="tree-view-search" placeholder="Search files…" @input="onSearch" />
      <h3 v-bind="api.getLabelProps()">My Documents</h3>
      <div v-bind="api.getTreeProps()">
        <TreeNode
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
