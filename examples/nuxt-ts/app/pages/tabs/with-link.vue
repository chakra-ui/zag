<script setup lang="ts">
import { tabsData } from "@zag-js/shared"
import * as tabs from "@zag-js/tabs"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/tabs.css"

const route = useRoute()
const router = useRouter()

const query = computed(() => ({
  controlled: "controlled" in route.query,
  automatic: "automatic" in route.query,
  native: "native" in route.query,
  cancel: "cancel" in route.query,
}))

const value = ref<string | null>("nils")

const id = useId()

const service = useMachine(
  tabs.machine,
  computed(() => ({
    id,
    defaultValue: "nils",
    value: query.value.controlled ? value.value : undefined,
    onValueChange(details: tabs.ValueChangeDetails) {
      value.value = details.value
    },
    activationMode: query.value.automatic ? ("automatic" as const) : ("manual" as const),
    ...(!query.value.native && {
      navigate(details: tabs.NavigateDetails) {
        router.push({ hash: `#${details.value}` })
      },
    }),
  })),
)

const api = computed(() => tabs.connect(service, normalizeProps))

const onRootClick = (event: MouseEvent) => {
  if (query.value.cancel) event.preventDefault()
}
</script>

<template>
  <main class="tabs" :data-ready="!service.context.get('ssr')">
    <div>
      <button @click="api.setValue('agnes')">Select Agnes with API</button>
      <button @click="value = 'joke'">Select Joke with prop</button>
    </div>
    <p>
      Selected: <output data-testid="value">{{ api.value ?? "none" }}</output>
    </p>
    <div v-bind="api.getRootProps()" @click="onRootClick">
      <div v-bind="api.getIndicatorProps()" />
      <div v-bind="api.getListProps()">
        <a
          v-for="data in tabsData"
          :key="data.id"
          :href="`#${data.id}`"
          v-bind="api.getTriggerProps({ value: data.id })"
        >
          {{ data.label }}
        </a>
      </div>
      <div v-for="data in tabsData" :key="data.id" v-bind="api.getContentProps({ value: data.id })">
        <p>{{ data.content }}</p>
        <input v-if="data.id === 'agnes'" placeholder="Agnes" />
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
