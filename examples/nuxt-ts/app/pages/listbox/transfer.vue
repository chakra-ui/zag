<script setup lang="ts">
import * as listbox from "@zag-js/listbox"
import "@styles/listbox.css"

interface Item {
  label: string
  value: string
}

const source = shallowRef(
  listbox.collection<Item>({
    items: [
      { label: "Naruto", value: "naruto" },
      { label: "Sasuke", value: "sasuke" },
      { label: "Sakura", value: "sakura" },
      { label: "Kakashi", value: "kakashi" },
      { label: "Shisui", value: "shisui" },
    ],
  }),
)

const target = shallowRef(listbox.collection<Item>({ items: [] }))

const selectedSource = ref<Item[]>([])
const selectedTarget = ref<Item[]>([])

const moveRight = () => {
  source.value = source.value.remove(...selectedSource.value)
  target.value = target.value.append(...selectedSource.value)
  selectedSource.value = []
}

const moveLeft = () => {
  source.value = source.value.append(...selectedTarget.value)
  target.value = target.value.remove(...selectedTarget.value)
  selectedTarget.value = []
}
</script>

<template>
  <main class="listbox">
    <div style="display: flex; gap: 1rem; width: 100%">
      <ListboxTransferList
        :collection="source"
        label="Source"
        :value="selectedSource.map((item) => item.value)"
        @value-change="(e) => (selectedSource = e.items)"
      />
      <div style="display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem">
        <button @click="moveRight">Move Right</button>
        <button @click="moveLeft">Move Left</button>
      </div>
      <ListboxTransferList
        :collection="target"
        label="Target"
        :value="selectedTarget.map((item) => item.value)"
        @value-change="(e) => (selectedTarget = e.items)"
      />
    </div>
  </main>
</template>
