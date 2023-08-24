<script setup lang="ts">
import * as avatar from "@zag-js/avatar"
import { avatarData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const images = avatarData.full
const getRandomImage = () => images[Math.floor(Math.random() * images.length)]

const src = ref(images[0])
const showImage = ref(true)

const [state, send] = useMachine(avatar.machine({ id: "1" }))
const api = computed(() => avatar.connect(state.value, send, normalizeProps))
</script>

<template>
  <main className="avatar">
    <div v-bind="api.rootProps">
      <span v-bind="api.fallbackProps">PA</span>
      <img v-if="showImage" alt="" referrerPolicy="no-referrer" :src="src" v-bind="api.imageProps" />
    </div>

    <div className="controls">
      <button @click="() => (src = getRandomImage())">Change Image</button>
      <button @click="() => (src = avatarData.broken)">Broken Image</button>
      <button @click="() => (showImage = !showImage)">Toggle Image</button>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="state" />
  </Toolbar>
</template>
