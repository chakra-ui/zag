<script setup lang="ts">
import { ref } from "vue"
import styles from "../../../../shared/styles/drawer.module.css"

const scenario = ref<"always-open" | "controlled">("controlled")
</script>

<template>
  <main style="padding: 20px">
    <div style="display: flex; gap: 8px; margin-bottom: 20px">
      <button
        type="button"
        :class="styles.trigger"
        :style="{ fontWeight: scenario === 'always-open' ? 700 : 400 }"
        @click="scenario = 'always-open'"
      >
        Always Open
      </button>
      <button
        type="button"
        :class="styles.trigger"
        :style="{ fontWeight: scenario === 'controlled' ? 700 : 400 }"
        @click="scenario = 'controlled'"
      >
        Controlled
      </button>
    </div>

    <DrawerControlledAlwaysOpen v-if="scenario === 'always-open'" />
    <DrawerControlledManaged v-else />
  </main>
</template>
