<script lang="ts" setup>
import * as toast from "@zag-js/toast"
import { normalizeProps, useMachine } from "@zag-js/vue"
import ConditionalContentToast from "../../components/ConditionalContentToast.vue"
import "@styles/toast.css"

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
    <fieldset class="hstack gap-4" :disabled="!ready">
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
