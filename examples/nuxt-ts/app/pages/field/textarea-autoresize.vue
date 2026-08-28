<script setup lang="ts">
import { autoresizeTextarea } from "@zag-js/auto-resize"
import * as field from "@zag-js/field"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/field.css"

const textareaRef = ref<HTMLTextAreaElement | null>(null)
let cleanup: VoidFunction | undefined

const id = useId()

const service = useMachine(
  field.machine,
  computed(() => ({
    id,
    validationMode: "onChange" as const,
    validate({ value }: field.ValidateDetails) {
      if (value.length > 100) return "Keep it under 100 characters"
      return null
    },
  })),
)

const api = computed(() => field.connect(service, normalizeProps))

onMounted(() => {
  cleanup = autoresizeTextarea(textareaRef.value)
})

onBeforeUnmount(() => cleanup?.())
</script>

<template>
  <main class="field-page">
    <h1>Field — Textarea autoresize</h1>
    <form @submit.prevent>
      <div v-bind="api.getRootProps()">
        <label v-bind="api.getLabelProps()">Bio</label>
        <textarea ref="textareaRef" v-bind="api.getTextareaProps()" rows="2" placeholder="Tell us about yourself…" />
        <span v-bind="api.getHelperTextProps()">The textarea grows with its content.</span>
        <span v-bind="api.getErrorTextProps()">{{ api.errors[0] }}</span>
      </div>
    </form>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
