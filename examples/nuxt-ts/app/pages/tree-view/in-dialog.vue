<script setup lang="ts">
import * as dialog from "@zag-js/dialog"
import * as tree from "@zag-js/tree-view"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { CheckSquare, MinusSquare, Square, XIcon } from "lucide-vue-next"
import "@styles/dialog.css"
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
      id: "furniture",
      name: "Furniture",
      children: [
        { id: "furniture/tables-chairs", name: "tables & chairs" },
        { id: "furniture/sofas", name: "sofas" },
        { id: "furniture/occasional", name: "occasional furniture" },
        { id: "furniture/childrens", name: "childrens furniture" },
        { id: "furniture/beds", name: "beds" },
      ],
    },
    {
      id: "decor",
      name: "Decor",
      children: [
        { id: "decor/bed-linen", name: "bed linen" },
        { id: "decor/throws", name: "throws" },
        { id: "decor/curtains-blinds", name: "curtains & blinds" },
        { id: "decor/rugs", name: "rugs" },
        { id: "decor/cushions", name: "cushions" },
      ],
    },
    {
      id: "lighting",
      name: "Lighting",
      children: [
        { id: "lighting/ceiling", name: "ceiling lights" },
        { id: "lighting/lamps", name: "lamps" },
        { id: "lighting/outdoor", name: "outdoor lighting" },
      ],
    },
    {
      id: "storage",
      name: "Storage",
      children: [
        { id: "storage/shelving", name: "shelving" },
        { id: "storage/wardrobes", name: "wardrobes" },
        { id: "storage/boxes", name: "boxes & baskets" },
      ],
    },
  ],
}

const initialCollection = tree.collection<Node>({
  nodeToValue: (node) => node.id,
  nodeToString: (node) => node.name,
  rootNode,
})

// `checkedValue` only holds leaf values (branch state is derived), so this drives "select all"
const collectLeafValues = (node: Node): string[] => {
  if (!node.children) return [node.id]
  return node.children.flatMap(collectLeafValues)
}
const allLeafValues = (rootNode.children ?? []).flatMap(collectLeafValues)

const iconMap = {
  true: CheckSquare,
  false: Square,
  indeterminate: MinusSquare,
}

const dialogId = useId()
const treeId = useId()

// `committed` is the applied selection; `draft` is the in-dialog working selection
const committed = ref<string[]>([])
const draft = ref<string[]>([])

const open = ref(false)
const collection = shallowRef(initialCollection)
const searchRef = ref<HTMLInputElement | null>(null)

const resetWorkingState = () => {
  draft.value = committed.value
  collection.value = initialCollection
}

const dialogService = useMachine(
  dialog.machine,
  computed(() => ({
    id: dialogId,
    open: open.value,
    // Roving tabindex makes the first tabbable node unpredictable; focus the search input instead
    initialFocusEl: () => searchRef.value,
    onOpenChange(details: dialog.OpenChangeDetails) {
      open.value = details.open
      // User-driven open and dismiss both start fresh from the committed selection
      resetWorkingState()
    },
  })),
)
const dialogApi = computed(() => dialog.connect(dialogService, normalizeProps))

const treeService = useMachine(
  tree.machine as tree.Machine<Node>,
  computed(() => ({
    id: treeId,
    collection: collection.value,
    checkedValue: draft.value,
    onCheckedChange(details: tree.CheckedChangeDetails) {
      draft.value = details.checkedValue
    },
  })),
)
const treeApi = computed(() => tree.connect(treeService, normalizeProps))

const selectedCount = computed(() => draft.value.length)
const allSelected = computed(() => selectedCount.value === allLeafValues.length && selectedCount.value > 0)
const selectAllIcon = computed(
  () => iconMap[allSelected.value ? "true" : selectedCount.value > 0 ? "indeterminate" : "false"],
)

const handleSearch = (event: Event) => {
  const value = (event.target as HTMLInputElement).value
  if (value.length === 0) {
    collection.value = initialCollection
    return
  }
  const filtered = initialCollection.filter((node) => node.name.toLowerCase().includes(value.toLowerCase()))
  collection.value = filtered
  treeApi.value.setExpandedValue(filtered.getBranchValues())
}

const handleCancel = () => {
  resetWorkingState()
  open.value = false
}

const handleOk = () => {
  committed.value = draft.value
  open.value = false
}
</script>

<template>
  <main>
    <button v-bind="dialogApi.getTriggerProps()">Select categories</button>
    <p>Applied: {{ committed.length > 0 ? committed.join(", ") : "none" }}</p>

    <Teleport v-if="dialogApi.open" to="#teleports">
      <div v-bind="dialogApi.getBackdropProps()" />
      <div v-bind="dialogApi.getPositionerProps()">
        <div
          v-bind="dialogApi.getContentProps()"
          style="display: flex; flex-direction: column; gap: 16px; max-height: 80vh; padding: 20px"
        >
          <header
            style="
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding-bottom: 12px;
              border-bottom: 1px solid #e2e8f0;
            "
          >
            <h2 v-bind="dialogApi.getTitleProps()" style="margin: 0">Categories</h2>
            <button v-bind="dialogApi.getCloseTriggerProps()">
              <XIcon />
            </button>
          </header>

          <input
            ref="searchRef"
            type="text"
            placeholder="Search categories"
            style="padding: 8px 12px"
            @input="handleSearch"
          />

          <div style="display: flex; align-items: center; justify-content: space-between">
            <button
              type="button"
              style="display: inline-flex; align-items: center; gap: 8px"
              @click="draft = allSelected ? [] : allLeafValues"
            >
              <component :is="selectAllIcon" /> Select All
            </button>
            <span style="color: #64748b">{{ selectedCount }} categories selected</span>
          </div>

          <div
            class="tree-view"
            style="flex: 1; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px"
          >
            <div v-bind="treeApi.getTreeProps()" style="width: 100%; margin-top: 0">
              <TreeViewCheckboxNode
                v-for="(node, index) in collection.rootNode.children"
                :key="node.id"
                :node="node"
                :index-path="[index]"
                :api="treeApi"
                bare
              />
            </div>
          </div>

          <footer
            style="display: flex; justify-content: flex-end; gap: 8px; padding-top: 12px; border-top: 1px solid #e2e8f0"
          >
            <button type="button" @click="handleCancel">Cancel</button>
            <button type="button" @click="handleOk">Ok</button>
          </footer>
        </div>
      </div>
    </Teleport>
  </main>
</template>
