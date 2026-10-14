<script setup lang="ts">
import * as carousel from "@zag-js/carousel"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/carousel.css"

// Variable width content (content-driven sizing)
const variableWidthData = [
  { content: "Short", color: "#ff6b6b", type: "text" },
  {
    content: "This is a much longer slide with significantly more content that will naturally take up more space",
    color: "#4ecdc4",
    type: "text",
  },
  { content: "Hi", color: "#45b7d1", type: "text" },
  { content: "Medium length slide content here", color: "#96ceb4", type: "text" },
  { content: "⭐ Star Rating Widget ⭐⭐⭐⭐⭐", color: "#ffeaa7", type: "widget" },
  { content: "X", color: "#dda0dd", type: "text" },
  { content: "🔥 Popular Item with Badge 🔥", color: "#98d8c8", type: "badge" },
  { content: "A", color: "#e74c3c", type: "text" },
  { content: "📊 Analytics Dashboard Component 📈📉", color: "#9b59b6", type: "component" },
]

const service = useMachine(carousel.machine, {
  id: useId(),
  autoSize: true,
  spacing: "16px",
  count: variableWidthData.length,
  allowMouseDrag: true,
  snapType: "mandatory",
})

const api = computed(() => carousel.connect(service, normalizeProps))

const fixedService = useMachine(carousel.machine, {
  id: useId(),
  autoSize: false,
  spacing: "16px",
  slidesPerPage: 2,
  count: variableWidthData.length,
  allowMouseDrag: true,
})

const fixedApi = computed(() => carousel.connect(fixedService, normalizeProps))

const slideStyle = (color: string) => ({
  minHeight: "120px",
  backgroundColor: color,
  borderRadius: "8px",
  color: "white",
  fontWeight: "bold",
  textAlign: "center" as const,
  padding: "16px",
  boxSizing: "border-box" as const,
})

const indicatorStyle = (active: boolean) => ({
  width: "12px",
  height: "12px",
  borderRadius: "50%",
  border: "none",
  backgroundColor: active ? "#333" : "#ccc",
  margin: "0 4px",
  cursor: "pointer",
})
</script>

<template>
  <main class="carousel-auto-size">
    <div v-bind="api.getRootProps()">
      <h2>Auto Size Carousel</h2>
      <p>Each slide has a different size based on its content.</p>

      <div v-bind="api.getControlProps()">
        <button v-bind="api.getAutoplayTriggerProps()">{{ api.isPlaying ? "Stop" : "Play" }}</button>
        <div class="carousel-spacer" />
        <button v-bind="api.getPrevTriggerProps()">← Prev</button>
        <button v-bind="api.getNextTriggerProps()">Next →</button>
      </div>

      <div v-bind="api.getItemGroupProps()">
        <div
          v-for="(slide, index) in variableWidthData"
          :key="index"
          v-bind="api.getItemProps({ index })"
          :style="{ ...(api.getItemProps({ index, snapAlign: 'center' }).style as object), ...slideStyle(slide.color) }"
        >
          {{ slide.content }}
        </div>
      </div>

      <div v-bind="api.getIndicatorGroupProps()">
        <button
          v-for="(_, index) in variableWidthData"
          :key="index"
          v-bind="api.getIndicatorProps({ index })"
          :style="indicatorStyle(index === api.page)"
        />
      </div>

      <div v-bind="api.getProgressTextProps()">{{ api.getProgressText() }}</div>
    </div>

    <div style="margin-top: 32px">
      <h3>Comparison: Fixed Width Carousel</h3>
      <div v-bind="fixedApi.getRootProps()">
        <div v-bind="fixedApi.getControlProps()">
          <button v-bind="fixedApi.getPrevTriggerProps()">← Prev</button>
          <div class="carousel-spacer" />
          <button v-bind="fixedApi.getNextTriggerProps()">Next →</button>
        </div>

        <div v-bind="fixedApi.getItemGroupProps()">
          <div
            v-for="(slide, index) in variableWidthData"
            :key="index"
            v-bind="fixedApi.getItemProps({ index })"
            :style="{
              ...slideStyle(slide.color),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }"
          >
            {{ slide.content }}
          </div>
        </div>

        <div v-bind="fixedApi.getIndicatorGroupProps()">
          <button
            v-for="(_, index) in fixedApi.pageSnapPoints"
            :key="index"
            v-bind="fixedApi.getIndicatorProps({ index })"
            :style="indicatorStyle(index === fixedApi.page)"
          />
        </div>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" :omit="['translations']" />
  </Toolbar>
</template>

<style scoped>
.carousel-auto-size {
  padding: 32px;
  max-width: 800px;
  margin: 0 auto;
}

.carousel-spacer {
  flex: 1;
}

h2 {
  margin-bottom: 8px;
}

p {
  margin-bottom: 24px;
  color: #666;
}
</style>
