<script setup lang="ts">
import { treeviewControls } from "@zag-js/shared"
import * as tree from "@zag-js/tree-view"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/tree-view.css"

interface Node {
  id: string
  name: string
  href?: string
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
        id: "docs",
        name: "Documentation",
        children: [
          { id: "docs/getting-started", name: "Getting Started", href: "/docs/getting-started" },
          { id: "docs/installation", name: "Installation", href: "/docs/installation" },
          {
            id: "docs/components",
            name: "Components",
            children: [
              { id: "docs/components/accordion", name: "Accordion", href: "/docs/components/accordion" },
              { id: "docs/components/dialog", name: "Dialog", href: "/docs/components/dialog" },
              { id: "docs/components/menu", name: "Menu", href: "/docs/components/menu" },
            ],
          },
        ],
      },
      {
        id: "examples",
        name: "Examples",
        children: [
          { id: "examples/react", name: "React Examples", href: "/examples/react" },
          { id: "examples/vue", name: "Vue Examples", href: "/examples/vue" },
          { id: "examples/solid", name: "Solid Examples", href: "/examples/solid" },
        ],
      },
      {
        id: "external",
        name: "External Links",
        children: [
          { id: "external/github", name: "GitHub Repository", href: "https://github.com/chakra-ui/zag" },
          { id: "external/npm", name: "NPM Package", href: "https://www.npmjs.com/package/@zag-js/core" },
          { id: "external/docs", name: "Official Docs", href: "https://zagjs.com" },
        ],
      },
      { id: "readme.md", name: "README.md", href: "/readme" },
      { id: "license", name: "LICENSE", href: "/license" },
    ],
  },
})

const controls = useControls(treeviewControls)

const service = useMachine(
  tree.machine,
  controls.mergeProps<tree.Props>({
    id: useId(),
    collection,
  }),
)

const api = computed(() => tree.connect(service, normalizeProps))
</script>

<template>
  <main class="tree-view">
    <div v-bind="api.getRootProps()">
      <h3 v-bind="api.getLabelProps()">Docs</h3>
      <div v-bind="api.getTreeProps()">
        <TreeViewLinkNode
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
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
