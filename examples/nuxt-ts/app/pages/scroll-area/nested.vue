<script setup lang="ts"></script>

<template>
  <main class="scroll-area">
    <ScrollArea style="height: 500px; width: 800px">
      <ScrollArea v-for="i in 5" :key="i" style="max-height: 200px">
        <div v-for="j in 100" :key="j">{{ j }}</div>
      </ScrollArea>
    </ScrollArea>
  </main>
</template>
