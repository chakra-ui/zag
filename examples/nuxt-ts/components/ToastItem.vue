<script lang="ts" setup>
import { normalizeProps, useMachine } from "@zag-js/vue"
import * as toast from "@zag-js/toast"
import { XIcon } from "lucide-vue-next"

interface Props {
  actor: toast.Props
  index: number
  parent: any
}

const props = defineProps<Props>()

const computedProps = computed(() => ({ ...props.actor, index: props.index, parent: props.parent }))

const service = useMachine(toast.machine, computedProps)
const api = computed(() => toast.connect(service, normalizeProps))
</script>

<template>
  <div v-bind="api.getRootProps()">
    <div v-bind="api.getGhostBeforeProps()"></div>
    <div data-scope="toast" data-part="progressbar"></div>
    <div v-bind="api.getTitleProps()">{{ api.title }} {{ service.state.get() }}</div>
    <div v-bind="api.getDescriptionProps()">{{ api.description }}</div>
    <button v-bind="api.getCloseTriggerProps()">
      <XIcon />
    </button>
    <div v-bind="api.getGhostAfterProps()"></div>
  </div>
</template>
