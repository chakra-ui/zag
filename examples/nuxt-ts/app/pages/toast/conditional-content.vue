<script lang="ts" setup>
import * as toast from "@zag-js/toast"
import { normalizeProps, useMachine } from "@zag-js/vue"
import ConditionalContentToast from "../../components/ConditionalContentToast.vue"

const store = toast.createStore<string>({ duration: Infinity })
const ready = ref(false)
const showTitle = ref(false)
const showDescription = ref(false)
const service = useMachine(toast.group.machine, { id: useId(), store })
const api = computed(() => toast.group.connect(service, normalizeProps))

onMounted(() => {
  ready.value = true
})
</script>

<template>
  <main>
    <h1>Conditional title and description</h1>
    <p>Toggle the optional title and description before or after creating a toast.</p>

    <fieldset :disabled="!ready" style="display: flex; align-items: center; gap: 16px; border: 0; padding: 0">
      <label><input v-model="showTitle" type="checkbox" /> Show title</label>
      <label><input v-model="showDescription" type="checkbox" /> Show description</label>
      <button @click="store.create({ id: 'draft', title: 'Draft saved', description: 'All changes are up to date.' })">
        Create toast
      </button>
    </fieldset>

    <Teleport to="#teleports">
      <div v-bind="api.getGroupProps()">
        <ConditionalContentToast
          v-for="(actor, index) in api.getToasts()"
          :key="actor.id"
          :actor="actor"
          :parent="service"
          :index="index"
          :show-title="showTitle"
          :show-description="showDescription"
        />
      </div>
    </Teleport>
  </main>
</template>
