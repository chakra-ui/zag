<script setup lang="ts">
import { treeviewControls } from "@zag-js/shared"
import * as tree from "@zag-js/tree-view"
import { normalizeProps, useMachine } from "@zag-js/vue"

const controls = useControls(treeviewControls)

const [state, send] = useMachine(tree.machine({ id: "1" }), {
  context: controls.context,
})

const api = computed(() => tree.connect(state.value, send, normalizeProps))
</script>

<template>
  <main class="tree-view">
    <div v-bind="api.getRootProps()">
      <h3 v-bind="api.getLabelProps()">My Documents</h3>
      <div>
        <button @click="api.collapse()">Collapse All</button>
        <button @click="api.expand()">Expand All</button>
        <span> - </span>
        <button @click="api.select()">Select All</button>
        <button @click="api.deselect()">Deselect All</button>
      </div>

      <ul v-bind="api.getTreeProps()">
        <li v-bind="api.getBranchProps({ value: 'node_modules', depth: 1 })">
          <div v-bind="api.getBranchControlProps({ value: 'node_modules', depth: 1 })">
            <span v-bind="api.getBranchTextProps({ value: 'node_modules', depth: 1 })"> 📂 node_modules</span>
          </div>

          <ul v-bind="api.getBranchContentProps({ value: 'node_modules', depth: 1 })">
            <li v-bind="api.getItemProps({ value: 'node_modules/zag-js', depth: 2 })">📄 zag-js</li>
            <li v-bind="api.getItemProps({ value: 'node_modules/pandacss', depth: 2 })">📄 panda</li>

            <li v-bind="api.getBranchProps({ value: 'node_modules/@types', depth: 2 })">
              <div v-bind="api.getBranchControlProps({ value: 'node_modules/@types', depth: 2 })">
                <span v-bind="api.getBranchTextProps({ value: 'node_modules/@types', depth: 2 })"> 📂 @types</span>
              </div>

              <ul v-bind="api.getBranchContentProps({ value: 'node_modules/@types', depth: 2 })">
                <li v-bind="api.getItemProps({ value: 'node_modules/@types/react', depth: 3 })">📄 react</li>
                <li v-bind="api.getItemProps({ value: 'node_modules/@types/react-dom', depth: 3 })">📄 react-dom</li>
              </ul>
            </li>
          </ul>
        </li>

        <li v-bind="api.getBranchProps({ value: 'src', depth: 1 })">
          <div v-bind="api.getBranchControlProps({ value: 'src', depth: 1 })">
            <span v-bind="api.getBranchTextProps({ value: 'src', depth: 1 })"> 📂 src</span>
          </div>

          <ul v-bind="api.getBranchContentProps({ value: 'src', depth: 1 })">
            <li v-bind="api.getItemProps({ value: 'src/app.tsx', depth: 2 })">📄 app.tsx</li>
            <li v-bind="api.getItemProps({ value: 'src/index.ts', depth: 2 })">📄 index.ts</li>
          </ul>
        </li>

        <li v-bind="api.getItemProps({ value: 'panda.config', depth: 1 })">📄 panda.config.ts</li>
        <li v-bind="api.getItemProps({ value: 'package.json', depth: 1 })">📄 package.json</li>
        <li v-bind="api.getItemProps({ value: 'renovate.json', depth: 1 })">📄 renovate.json</li>
        <li v-bind="api.getItemProps({ value: 'readme.md', depth: 1 })">📄 README.md</li>
      </ul>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="state" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
