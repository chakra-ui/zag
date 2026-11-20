<script setup lang="ts">
import "@styles/editable.css"

const people = [
  { name: "Ada Lovelace", role: "Engineering" },
  { name: "Grace Hopper", role: "Platform" },
  { name: "Alan Turing", role: "Research" },
]

const activity = ref<string[]>([])
const log = (entry: string) => (activity.value = [entry, ...activity.value])
</script>

<template>
  <main>
    <div class="editable-table-cells">
      <p class="hint">Double-click a name to rename it</p>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Team</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(person, index) in people" :key="person.name">
            <td><EditableNameCell :row="index + 1" :default-name="person.name" @log="log" /></td>
            <td>{{ person.role }}</td>
          </tr>
        </tbody>
      </table>
      <ol class="activity" aria-label="Activity" reversed>
        <li v-for="(entry, index) in activity" :key="activity.length - index">{{ entry }}</li>
      </ol>
    </div>
  </main>
</template>
