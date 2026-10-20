<script lang="ts" setup>
import * as toast from "@zag-js/toast"
import { normalizeProps, useMachine } from "@zag-js/vue"

const props = defineProps<{ store: toast.Store }>()

const service = useMachine(toast.group.machine, { id: useId(), store: props.store })
const api = computed(() => toast.group.connect(service, normalizeProps))
</script>

<template>
  <Teleport to="#teleports">
    <div v-bind="api.getGroupProps()">
      <ToastItem
        v-for="(actor, index) in api.getToasts()"
        :key="actor.id"
        :actor="actor"
        :index="index"
        :parent="service"
      />
    </div>
  </Teleport>
</template>
