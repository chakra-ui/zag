<script setup lang="ts">
import * as combobox from "@zag-js/combobox"
import { createFilter } from "@zag-js/i18n-utils"
import * as tree from "@zag-js/tree-view"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"
import { ChevronDownIcon, XIcon } from "lucide-vue-next"
import styles from "@styles/tree-view-combobox-filter.module.css"

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
    { id: "panda.config", name: "panda.config.ts" },
    { id: "package.json", name: "package.json" },
    { id: "readme.md", name: "README.md" },
  ],
}

const sourceCollection = tree.collection<Node>({
  nodeToValue: (node) => node.id,
  nodeToString: (node) => node.name,
  rootNode,
})

function flattenNodes(nodes: Node[] | undefined, items: Node[] = []) {
  for (const node of nodes ?? []) {
    items.push(node)
    flattenNodes(node.children, items)
  }
  return items
}

const flatItems = flattenNodes(rootNode.children)

const { contains } = createFilter({ sensitivity: "base" })

function getAncestorValues(value: string) {
  return sourceCollection.getParentNodes(value).map((node) => sourceCollection.getNodeValue(node))
}

const comboboxCollection = combobox.collection({
  items: flatItems,
  itemToValue: (item) => item.id,
  itemToString: (item) => sourceCollection.stringify(item.id) ?? item.name,
})

const query = ref("")
const expanded = ref<string[]>([])

const visibleCollection = computed(() => {
  const normalized = query.value.trim()
  if (!normalized) return sourceCollection
  return sourceCollection.filter((node, indexPath) => {
    const path = sourceCollection.getValuePath(indexPath).join("/")
    return contains(node.name, normalized) || contains(path, normalized)
  })
})

const expandedValue = computed(() => {
  if (query.value.trim()) return visibleCollection.value.getBranchValues()
  return expanded.value
})

const comboboxService = useMachine(combobox.machine as combobox.Machine<Node>, {
  id: useId(),
  collection: comboboxCollection,
  popupType: "dialog",
  openOnClick: true,
  placeholder: "Search or select a file...",
  closeOnSelect: false,
  onInputValueChange({ inputValue }) {
    query.value = inputValue
  },
})

const comboboxApi = computed(() => combobox.connect(comboboxService, normalizeProps))

// Restore the selected label once the popup closes
watch(
  () => comboboxApi.value.open,
  (open, wasOpen) => {
    if (!wasOpen || open) return
    query.value = ""
    const api = comboboxApi.value
    const selected = api.value[0]
    const label = selected ? (sourceCollection.stringify(selected) ?? selected) : ""
    if (api.inputValue !== label) {
      api.setInputValue(label, "script")
    }
  },
)

// Reveal the selected file when reopening without a query
watch(
  () => [comboboxApi.value.open, comboboxApi.value.value, query.value] as const,
  ([open, value, q]) => {
    if (!open || q.trim()) return
    const selected = value[0]
    if (!selected) return
    expanded.value = [...new Set([...expanded.value, ...getAncestorValues(selected)])]
  },
)

const treeId = useId()

const treeService = useMachine(
  tree.machine,
  computed(() => ({
    id: treeId,
    collection: visibleCollection.value,
    expandedValue: expandedValue.value,
    selectionMode: "single" as const,
    selectedValue: comboboxApi.value.value,
    typeahead: false,
    onExpandedChange(details: tree.ExpandedChangeDetails) {
      if (query.value.trim()) return
      expanded.value = details.expandedValue
    },
    onSelectionChange(details: tree.SelectionChangeDetails) {
      const value = details.selectedValue[0]
      if (!value) return
      // Files only: a folder just expands or collapses
      const node = sourceCollection.findNode(value)
      if (node && sourceCollection.isBranchNode(node)) return
      const label = sourceCollection.stringify(value) ?? value
      const api = comboboxApi.value
      api.setValue([value])
      api.setInputValue(label, "script")
      api.setOpen(false)
      query.value = ""
    },
  })),
)

const treeApi = computed(() => tree.connect(treeService, normalizeProps))
const visibleCount = computed(() => visibleCollection.value.getValues().length)
const selectedLabel = computed(() => {
  const selected = comboboxApi.value.value[0]
  return selected ? sourceCollection.stringify(selected) : null
})

const inputProps = computed(() =>
  mergeProps(comboboxApi.value.getInputProps(), {
    class: styles.input,
    onKeydown(event: KeyboardEvent) {
      if (!comboboxApi.value.open) return
      if (event.key === "ArrowDown") {
        const first = visibleCollection.value.getFirstNode()
        if (first) {
          treeApi.value.focus(sourceCollection.getNodeValue(first))
          event.preventDefault()
        }
      }
    },
  }),
)
</script>

<template>
  <main>
    <div :class="styles.root">
      <div :class="styles.header">
        <h3>Tree Picker</h3>
        <p>Combobox input filters the tree popup. Branches auto-expand while searching.</p>
      </div>

      <div v-bind="comboboxApi.getRootProps()">
        <label v-bind="mergeProps(comboboxApi.getLabelProps(), { class: styles.label })">File</label>
        <div v-bind="mergeProps(comboboxApi.getControlProps(), { class: styles.control })">
          <input v-bind="inputProps" />
          <button
            type="button"
            v-bind="mergeProps(comboboxApi.getTriggerProps({ focusable: false }), { class: styles.trigger })"
          >
            <ChevronDownIcon />
          </button>
          <button type="button" v-bind="mergeProps(comboboxApi.getClearTriggerProps(), { class: styles.clearTrigger })">
            <XIcon />
          </button>
        </div>
      </div>

      <p :class="styles.selection">
        Selected: <strong>{{ selectedLabel ?? "none" }}</strong>
      </p>

      <Teleport to="#teleports">
        <div v-bind="comboboxApi.getPositionerProps()">
          <div v-bind="mergeProps(comboboxApi.getContentProps(), { class: styles.content })">
            <div :class="styles.treePanel">
              <div v-if="visibleCount === 0" :class="styles.empty">No matches for "{{ query.trim() }}"</div>
              <div v-else v-bind="mergeProps(treeApi.getTreeProps(), { class: styles.tree })">
                <TreeViewComboboxNode
                  v-for="(node, index) in visibleCollection.rootNode.children"
                  :key="node.id"
                  :node="node"
                  :index-path="[index]"
                  :api="treeApi"
                />
              </div>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="comboboxService" :omit="['collection']" />
    <StateVisualizer :state="treeService" :omit="['collection']" label="tree" />
  </Toolbar>
</template>
