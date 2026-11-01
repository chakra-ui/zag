<script lang="ts" setup>
import * as toast from "@zag-js/toast"
import "@styles/toast.css"

const placements: toast.Placement[] = ["top-start", "top", "top-end", "bottom-start", "bottom", "bottom-end"]

const toasters = new Map(placements.map((placement) => [placement, toast.createStore({ placement })]))
</script>

<template>
  <main>
    <div class="hstack">
      <button
        v-for="placement in placements"
        :key="placement"
        @click="toasters.get(placement)!.create({ title: `Toast at ${placement}` })"
      >
        {{ placement }}
      </button>
    </div>
    <ToastPlacementToaster v-for="placement in placements" :key="placement" :store="toasters.get(placement)!" />
  </main>
</template>
