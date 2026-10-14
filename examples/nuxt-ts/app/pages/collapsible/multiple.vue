<script setup lang="ts">
import "@styles/collapsible.css"

const list = ref([1, 2, 3])
const open = ref(true)
</script>

<template>
  <main>
    <div style="display: flex; gap: 10px">
      <CollapsibleMultipleItem v-for="value in list" :key="value" :value="value" :open="open" />
    </div>
    <pre>list:{{ list.toString() }}; open: {{ open.toString() }}</pre>

    <div>
      <button @click="list = [...list].reverse()">reverse</button>
      <button @click="open = !open">toggle collapse</button>
    </div>
  </main>
</template>
