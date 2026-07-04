<script setup lang="ts">
import * as numberInput from "@zag-js/number-input"
import * as select from "@zag-js/select"
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
  { label: "Sans-serif", value: "sans-serif" },
  { label: "Serif", value: "serif" },
  { label: "Monospace", value: "monospace" },
]

const format = ref<string[]>([])
const font = ref("sans-serif")
const fontSize = ref("16")

const service = useMachine(toolbar.machine, { id: useId() })
const api = computed(() => toolbar.connect(service, normalizeProps))

const fontId = useId()
const fontService = useMachine(
  select.machine,
  computed(() => ({
    id: fontId,
    ids: { trigger: api.value.getItemId("font") },
    collection: select.collection({ items: fonts }),
    disabled: api.value.disabled,
    defaultValue: ["sans-serif"],
    onValueChange(details) {
      font.value = details.value[0]
    },
  })),
)
const fontApi = computed(() => select.connect(fontService, normalizeProps))

const sizeId = useId()
const sizeService = useMachine(
  numberInput.machine,
  computed(() => ({
    id: sizeId,
    ids: { input: api.value.getItemId("font-size") },
    disabled: api.value.disabled,
    defaultValue: "16",
    min: 8,
    max: 96,
    onValueChange(details) {
      fontSize.value = details.value
    },
  })),
)
const sizeApi = computed(() => numberInput.connect(sizeService, normalizeProps))

const formatId = useId()
const formatService = useMachine(
  toggleGroup.machine,
  computed(() => ({
    id: formatId,
    disabled: api.value.disabled,
    orientation: api.value.orientation,
    multiple: true,
    defaultValue: [],
    onValueChange(details) {
      format.value = details.value
    },
  })),
)
const formatApi = computed(() => toggleGroup.connect(formatService, normalizeProps))
</script>

<template>
  <main class="toolbar">
    <div class="toolbar-editor">
      <div v-bind="api.getRootProps()">
        <button v-bind="mergeProps(fontApi.getTriggerProps(), api.getItemProps({ value: 'font' }))">
          <span>{{ fontApi.valueAsString }}</span>
          <span aria-hidden>v</span>
        </button>
        <Teleport to="#teleports">
          <div v-bind="fontApi.getPositionerProps()">
            <div v-bind="fontApi.getContentProps()">
              <ul v-bind="fontApi.getListProps()">
                <li v-for="item in fonts" :key="item.value" v-bind="fontApi.getItemProps({ item })">
                  <span v-bind="fontApi.getItemTextProps({ item })">{{ item.label }}</span>
                </li>
              </ul>
            </div>
          </div>
        </Teleport>

        <div v-bind="api.getSeparatorProps()" />

        <div v-bind="sizeApi.getControlProps()">
          <button v-bind="sizeApi.getDecrementTriggerProps()" aria-label="Decrease font size">-</button>
          <input class="toolbar-number-input" v-bind="mergeProps(sizeApi.getInputProps(), api.getInputProps({ value: 'font-size' }))" />
          <button v-bind="sizeApi.getIncrementTriggerProps()" aria-label="Increase font size">+</button>
        </div>

        <div v-bind="api.getSeparatorProps()" />

        <div v-bind="formatApi.getRootProps()">
          <button v-bind="formatApi.getItemProps({ value: 'bold' })" aria-label="Bold"><strong>B</strong></button>
          <button v-bind="formatApi.getItemProps({ value: 'italic' })" aria-label="Italic"><em>I</em></button>
          <button v-bind="formatApi.getItemProps({ value: 'underline' })" aria-label="Underline"><u>U</u></button>
        </div>
      </div>

      <div
        class="toolbar-editor-preview"
        :style="{
          fontWeight: format.includes('bold') ? 'bold' : 'normal',
          fontStyle: format.includes('italic') ? 'italic' : 'normal',
          textDecoration: format.includes('underline') ? 'underline' : 'none',
          fontFamily: font,
          fontSize: `${fontSize}px`,
        }"
      >
        The quick brown fox jumps over the lazy dog.
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>

