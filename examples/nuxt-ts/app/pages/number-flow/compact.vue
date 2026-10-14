<script setup lang="ts">
import { HeartIcon } from "lucide-vue-next"
import "@styles/number-flow.css"

const compact = { notation: "compact", maximumFractionDigits: 1 } as const

const views = ref(12_480)
const likes = ref(1_249)
const liked = ref(false)

// Views keep climbing; compact notation keeps the figure short
onMounted(() => {
  const id = setInterval(() => {
    views.value += Math.round(Math.random() * 600)
  }, 1200)
  onBeforeUnmount(() => clearInterval(id))
})

const toggleLike = () => {
  likes.value += liked.value ? -1 : 1
  liked.value = !liked.value
}
</script>

<template>
  <main class="number-flow">
    <div class="nf-card">
      <span class="nf-card-title">Launch video</span>
      <div class="nf-stats">
        <div>
          <NumberFlowDisplay :value="views" :format-options="compact" />
          <span class="nf-caption">Views</span>
        </div>
        <div>
          <NumberFlowDisplay :value="likes" :format-options="compact" />
          <span class="nf-caption">Likes</span>
        </div>
      </div>
      <button class="nf-like" :aria-pressed="liked" @click="toggleLike">
        <HeartIcon /> {{ liked ? "Liked" : "Like" }}
      </button>
    </div>
  </main>
</template>
