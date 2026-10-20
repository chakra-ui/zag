<script lang="ts" setup>
import { normalizeProps, useMachine } from "@zag-js/vue"
import * as toast from "@zag-js/toast"
import { CircleCheck, CircleX, Info, LoaderCircle, TriangleAlert, XIcon } from "lucide-vue-next"
import type { Component } from "vue"

const icons: Record<string, Component> = {
  success: CircleCheck,
  error: CircleX,
  warning: TriangleAlert,
  info: Info,
  loading: LoaderCircle,
}

interface Props {
  actor: toast.Props
  index: number
  parent: any
}

const props = defineProps<Props>()

const computedProps = computed(() => ({ ...props.actor, index: props.index, parent: props.parent }))

const service = useMachine(toast.machine, computedProps)
const api = computed(() => toast.connect(service, normalizeProps))
const icon = computed(() => icons[api.value.type])

// Title and description may be strings or vnodes
const Title = () => api.value.title
const Description = () => api.value.description
</script>

<template>
  <div v-bind="api.getRootProps()">
    <div v-bind="api.getGhostBeforeProps()"></div>
    <div data-scope="toast" data-part="progressbar"></div>
    <span v-if="icon" data-scope="toast" data-part="indicator">
      <component :is="icon" />
    </span>
    <div data-scope="toast" data-part="content">
      <div v-if="api.title" v-bind="api.getTitleProps()"><Title /></div>
      <div v-if="api.description" v-bind="api.getDescriptionProps()"><Description /></div>
    </div>
    <button v-if="props.actor.action" v-bind="api.getActionTriggerProps()">
      {{ props.actor.action.label }}
    </button>
    <button v-if="api.closable" v-bind="api.getCloseTriggerProps()">
      <XIcon />
    </button>
    <div v-bind="api.getGhostAfterProps()"></div>
  </div>
</template>
