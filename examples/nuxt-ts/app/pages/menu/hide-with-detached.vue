<script setup lang="ts">
import "@styles/menu.css"
</script>

<template>
  <main style="height: 100vh; display: flex; justify-content: center; align-items: center; gap: 40px">
    <div style="display: flex; justify-content: center; align-items: center">
      <div
        style="
          display: flex;
          width: 300px;
          height: 100%;
          overflow-x: scroll;
          column-gap: 24px;
          flex-shrink: 0;
          padding: 16px;
          border: 1px solid #ccc;
          background-color: #f0f0f0;
        "
      >
        <div
          v-for="x in 6"
          :key="x"
          style="background-color: lightgray; border-radius: 4px; padding: 16px; white-space: nowrap"
        >
          Item {{ x - 1 }}
        </div>
        <div>
          <MenuDetachedMenu />
        </div>
      </div>
    </div>

    <div style="background-color: #ffffff; border: 1px solid black">
      <div
        style="
          display: flex;
          flex-direction: column;
          gap: 16px;
          align-items: center;
          max-height: 200px;
          width: 200px;
          overflow-y: auto;
          border: 1px solid black;
        "
      >
        <MenuDetachedMenu v-for="x in 12" :key="x" />
      </div>
    </div>
  </main>
</template>
