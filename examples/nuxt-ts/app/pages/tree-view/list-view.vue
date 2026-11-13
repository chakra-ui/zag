<script setup lang="ts">
import * as tree from "@zag-js/tree-view"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { ListIcon, ListTreeIcon } from "lucide-vue-next"
import "@styles/tree-view.css"

interface Node {
  id: string
  name: string
  children?: Node[]
}

const rootNode: Node = {
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
    { id: "readme.md", name: "README.md" },
  ],
}

const options = { nodeToValue: (node: Node) => node.id, nodeToString: (node: Node) => node.name }
const treeCollection = tree.collection<Node>({ ...options, rootNode })

// Every file as one row, named by its full path. Ids match the tree, so selection carries over.
const files = treeCollection.getDescendantNodes([]).map((node) => ({
  id: node.id,
  name: [...treeCollection.getParentNodes(node.id), node].map((n) => n.name).join("/"),
}))

const listCollection = tree.collection<Node>({ ...options, rootNode: { ...rootNode, children: files } })

type View = "tree" | "list"

const view = ref<View>("tree")
const collection = computed(() => (view.value === "tree" ? treeCollection : listCollection))

const id = useId()
const service = useMachine(
  tree.machine,
  computed(() => ({ id, collection: collection.value })),
)

const api = computed(() => tree.connect(service, normalizeProps))
</script>

<template>
  <main class="tree-view">
    <div v-bind="api.getRootProps()">
      <h3 v-bind="api.getLabelProps()">My Documents</h3>
      <div style="display: flex; gap: 10px">
        <button :aria-pressed="view === 'tree'" @click="view = 'tree'"><ListTreeIcon /> Tree</button>
        <button :aria-pressed="view === 'list'" @click="view = 'list'"><ListIcon /> List</button>
      </div>
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

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
