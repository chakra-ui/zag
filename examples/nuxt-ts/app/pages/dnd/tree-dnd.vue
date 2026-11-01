<script lang="ts" setup>
import * as dnd from "@zag-js/dnd"
import * as tree from "@zag-js/tree-view"
import { normalizeProps, useMachine } from "@zag-js/vue"
import styles from "@styles/dnd-tree.module.css"
import "@styles/tree-view.css"

interface Node {
  id: string
  name: string
  children?: Node[]
}

const initialData: Node = {
  id: "ROOT",
  name: "",
  children: [
    {
      id: "src",
      name: "src",
      children: [
        { id: "src/app.tsx", name: "app.tsx" },
        { id: "src/index.ts", name: "index.ts" },
        {
          id: "src/components",
          name: "components",
          children: [
            { id: "src/components/button.tsx", name: "button.tsx" },
            { id: "src/components/input.tsx", name: "input.tsx" },
          ],
        },
      ],
    },
    {
      id: "public",
      name: "public",
      children: [
        { id: "public/favicon.ico", name: "favicon.ico" },
        { id: "public/logo.svg", name: "logo.svg" },
      ],
    },
    { id: "package.json", name: "package.json" },
    { id: "tsconfig.json", name: "tsconfig.json" },
    { id: "readme.md", name: "README.md" },
  ],
}

function createCollection(rootNode: Node) {
  return tree.collection<Node>({
    nodeToValue: (node) => node.id,
    nodeToString: (node) => node.name,
    rootNode,
  })
}

const collection = shallowRef(createCollection(initialData))
const expandedValue = ref<string[]>(["src", "public"])

const treeId = useId()
const treeService = useMachine(
  tree.machine,
  computed<tree.Props>(() => ({
    id: treeId,
    collection: collection.value,
    expandedValue: expandedValue.value,
    onExpandedChange(details) {
      expandedValue.value = details.expandedValue
    },
  })),
)
const treeApi = computed(() => tree.connect(treeService, normalizeProps))

const dndService = useMachine(dnd.machine, {
  id: useId(),
  dropPlacements: ["before", "after", "on"],
  getValueText(value) {
    return collection.value.stringify(value) ?? value
  },
  canDrop(source, target, placement) {
    if (source === target && placement === "on") return false
    const sourcePath = collection.value.getIndexPath(source)
    const targetPath = collection.value.getIndexPath(target)
    if (sourcePath && targetPath) {
      return !collection.value.contains(sourcePath, targetPath)
    }
    return true
  },
  onDrop({ source, target, placement }) {
    const sourcePath = collection.value.getIndexPath(source)
    const targetPath = collection.value.getIndexPath(target)
    if (!sourcePath || !targetPath) return

    let toPath: number[]
    switch (placement) {
      case "before":
        toPath = targetPath
        break
      case "after":
        toPath = [...targetPath.slice(0, -1), (targetPath[targetPath.length - 1] ?? 0) + 1]
        break
      case "on":
        toPath = [...targetPath, 0]
        expandedValue.value = [...new Set([...expandedValue.value, target])]
        break
    }

    collection.value = collection.value.move([sourcePath], toPath)
  },
})
const dndApi = computed(() => dnd.connect(dndService, normalizeProps))
</script>

<template>
  <main class="tree-view">
    <div v-bind="treeApi.getRootProps()">
      <h3 v-bind="treeApi.getLabelProps()">File Explorer (Drag &amp; Drop)</h3>
      <div v-bind="dndApi.getRootProps()" :class="styles.root">
        <div v-bind="treeApi.getTreeProps()">
          <DndTreeNode
            v-for="(node, index) in collection.rootNode.children"
            :key="node.id"
            :node="node"
            :index-path="[index]"
            :tree-api="treeApi"
            :dnd-api="dndApi"
          />
        </div>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="dndService" />
  </Toolbar>
</template>
