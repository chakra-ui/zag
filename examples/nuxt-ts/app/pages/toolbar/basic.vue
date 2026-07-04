<script setup lang="ts">
import * as select from "@zag-js/select"
import { toolbarControls, toolbarData } from "@zag-js/shared"
import * as toggleGroup from "@zag-js/toggle-group"
import * as toolbar from "@zag-js/toolbar"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/toolbar.css"
import "@styles/toggle-group.css"
import "@styles/select.css"

interface Font {
  label: string
  value: string
}

const fonts: Font[] = [
  { label: "Helvetica", value: "helvetica" },
  { label: "Arial", value: "arial" },
  { label: "Georgia", value: "georgia" },
]

const controls = useControls(toolbarControls)

const service = useMachine(
  toolbar.machine,
  controls.mergeProps<toolbar.Props>({
    id: useId(),
  }),
)
const api = computed(() => toolbar.connect(service, normalizeProps))

const alignmentId = useId()
const alignmentService = useMachine(
  toggleGroup.machine,
  computed(() => ({
    id: alignmentId,
    disabled: api.value.disabled,
    orientation: api.value.orientation,
    defaultValue: ["left"],
  })),
)
const alignmentApi = computed(() => toggleGroup.connect(alignmentService, normalizeProps))

const fontId = useId()
const fontService = useMachine(
  select.machine,
  computed(() => ({
    id: fontId,
    ids: { trigger: api.value.getItemId("font") },
    collection: select.collection({ items: fonts }),
    disabled: api.value.disabled,
    defaultValue: ["helvetica"],
  })),
)
const fontApi = computed(() => select.connect(fontService, normalizeProps))
</script>

<template>
  <main class="toolbar">
    <div v-bind="api.getRootProps()">
      <div v-bind="alignmentApi.getRootProps()">
        <button v-bind="alignmentApi.getItemProps({ value: 'left' })" aria-label="Align left">⯇</button>
        <button v-bind="alignmentApi.getItemProps({ value: 'right' })" aria-label="Align right">⯈</button>
      </div>

      <div v-bind="api.getSeparatorProps()" />

      <div v-bind="api.getGroupProps({ value: 'clipboard' })">
        <button v-for="item in toolbarData" :key="item.id" v-bind="api.getItemProps({ value: item.id })">
          {{ item.label }}
        </button>
      </div>

      <div v-bind="api.getSeparatorProps()" />

      <button v-bind="mergeProps(fontApi.getTriggerProps(), api.getItemProps({ value: 'font' }))">
        <span>{{ fontApi.valueAsString || "Font" }}</span>
        <span aria-hidden>▾</span>
      </button>
      <Teleport to="#teleports">
        <div v-bind="fontApi.getPositionerProps()">
          <ul v-bind="fontApi.getContentProps()">
            <li v-for="item in fonts" :key="item.value" v-bind="fontApi.getItemProps({ item })">
              <span v-bind="fontApi.getItemTextProps({ item })">{{ item.label }}</span>
            </li>
          </ul>
        </div>
      </Teleport>

      <div v-bind="api.getSeparatorProps()" />

      <a v-bind="api.getLinkProps({ value: 'edited' })" href="https://zagjs.com" target="_blank" rel="noreferrer">
        Edited 51m ago
      </a>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
