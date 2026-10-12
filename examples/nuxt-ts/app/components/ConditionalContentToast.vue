<script lang="ts" setup>
import * as toast from "@zag-js/toast"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { XIcon } from "lucide-vue-next"

const props = defineProps<{
  actor: toast.Options<string>
  parent: toast.GroupService
  index: number
  showTitle: boolean
  showDescription: boolean
}>()

const service = useMachine(
  toast.machine,
  computed(() => ({ ...props.actor, parent: props.parent, index: props.index })),
)
const api = computed(() => toast.connect(service, normalizeProps))
</script>

<template>
  <div v-bind="api.getRootProps()">
    <div style="flex: 1">
      <p>Your draft is ready.</p>
      <div v-if="showTitle" v-bind="api.getTitleProps()">{{ api.title }}</div>
      <div v-if="showDescription" v-bind="api.getDescriptionProps()">{{ api.description }}</div>
    </div>
    <button v-bind="api.getCloseTriggerProps()">
      <XIcon />
    </button>
  </div>
</template>
