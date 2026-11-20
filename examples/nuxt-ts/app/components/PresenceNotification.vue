<script setup lang="ts">
import * as presence from "@zag-js/presence"
import { normalizeProps, useMachine } from "@zag-js/vue"

const props = defineProps<{ title: string; meta: string }>()
const emit = defineEmits<{ remove: [] }>()

const present = ref(true)

const service = useMachine(
  presence.machine,
  computed<presence.Props>(() => ({ present: present.value, onExitComplete: () => emit("remove") })),
)
const api = computed(() => presence.connect(service, normalizeProps))

const setNode = (node: unknown) => {
  if (node) api.value.setNode(node as HTMLElement)
}
</script>

<template>
  <li v-if="api.present" :ref="setNode" :data-state="api.skip ? undefined : present ? 'open' : 'closed'">
    <span>
      <strong>{{ props.title }}</strong>
      <br />
      <span class="meta">{{ props.meta }}</span>
    </span>
    <button type="button" @click="present = false">Dismiss</button>
  </li>
</template>
