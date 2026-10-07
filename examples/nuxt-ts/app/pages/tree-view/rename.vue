<script setup lang="ts">
import * as tree from "@zag-js/tree-view"
import { normalizeProps, useMachine } from "@zag-js/vue"

interface Node {
  id: string
  name: string
  children?: Node[]
}

const collection = ref(
  tree.collection<Node>({
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
  }),
)

const id = useId()

const service = useMachine(
  tree.machine,
  computed<tree.Props<Node>>(() => ({
    id,
    collection: collection.value,
    canRename: (node) => !node.children,
    onRenameComplete(details) {
      const node = collection.value.at(details.indexPath)
      collection.value = collection.value.replace(details.indexPath, { ...node, name: details.label })
    },
  })),
)

const api = computed(() => tree.connect(service, normalizeProps))
</script>

<template>
  <main class="tree-view">
    <div v-bind="api.getRootProps()">
      <h3 v-bind="api.getLabelProps()">My Documents (Renameable)</h3>
      <div v-bind="api.getTreeProps()">
        <TreeNode
          v-for="(node, index) in api.collection.rootNode.children"
          :key="node.id"
          :node="node"
          :index-path="[index]"
          :api="api"
        />
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" :omit="['collection']" />
  </Toolbar>
</template>
