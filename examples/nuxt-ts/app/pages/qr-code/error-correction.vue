<script setup lang="ts">
import "@styles/qr-code.css"

type Ecc = "L" | "M" | "Q" | "H"

const levels: { ecc: Ecc; recovery: string }[] = [
  { ecc: "L", recovery: "~7% recoverable" },
  { ecc: "M", recovery: "~15% recoverable" },
  { ecc: "Q", recovery: "~25% recoverable" },
  { ecc: "H", recovery: "~30% recoverable" },
]
</script>

<template>
  <main class="qr-code">
    <div class="hstack gap-5">
      <QrCodeEccLevel v-for="level in levels" :key="level.ecc" v-bind="level" />
    </div>
  </main>
</template>
