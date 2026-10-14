<script setup lang="ts">
import * as menu from "@zag-js/menu"
import * as tree from "@zag-js/tree-view"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/tree-view.css"
import "@styles/menu.css"

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

const treeService = useMachine(tree.machine, { id: useId(), collection })
const treeApi = computed(() => tree.connect(treeService, normalizeProps))

const menuService = useMachine(menu.machine, { id: useId() })
const menuApi = computed(() => menu.connect(menuService, normalizeProps))
</script>

<template>
  <main class="tree-view">
    <div v-bind="treeApi.getRootProps()">
      <h3 v-bind="treeApi.getLabelProps()">My Documents</h3>
      <div style="display: flex; gap: 10px">
        <button @click="treeApi.collapse()">Collapse All</button>
        <button @click="treeApi.expand()">Expand All</button>
      </div>
      <div v-bind="treeApi.getTreeProps()">
        <TreeViewActionsNode
          v-for="(node, index) in collection.rootNode.children"
          :key="node.id"
          :node="node"
          :index-path="[index]"
          :tree-api="treeApi"
          :menu-api="menuApi"
        />
      </div>
    </div>

    <Teleport to="#teleports">
      <div v-bind="menuApi.getPositionerProps()">
        <Presence v-bind="menuApi.getContentProps()">
          <div v-bind="menuApi.getItemProps({ value: 'rename' })">Rename "{{ menuApi.triggerValue }}"</div>
          <div v-bind="menuApi.getItemProps({ value: 'duplicate' })">Duplicate</div>
          <div v-bind="menuApi.getItemProps({ value: 'delete' })">Delete</div>
        </Presence>
      </div>
    </Teleport>
  </main>
</template>
