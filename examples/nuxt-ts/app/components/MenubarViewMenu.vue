<script setup lang="ts">
import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/vue"
import type { ComputedRef } from "vue"

interface ViewSettings {
  lineNumbers: boolean
  wordWrap: boolean
  theme: string
}

const props = defineProps<{ settings: ViewSettings }>()
const emit = defineEmits<{ change: [settings: ViewSettings] }>()

const themes = ["Light", "Dark", "System"]
const checkboxes = [
  { value: "line-numbers", label: "Show line numbers", key: "lineNumbers" as const },
  { value: "word-wrap", label: "Word wrap", key: "wordWrap" as const },
]

const menubarContext = inject<ComputedRef<menu.MenubarContext> | undefined>("menubar", undefined)
const service = useMachine(
  menu.machine,
  computed<menu.Props>(() => ({ id: "view", menubar: menubarContext ? menubarContext.value : undefined })),
)
const api = computed(() => menu.connect(service, normalizeProps))

const checkboxItem = (option: (typeof checkboxes)[number]) => ({
  type: "checkbox" as const,
  value: option.value,
  checked: props.settings[option.key],
  onCheckedChange: (checked: boolean) => emit("change", { ...props.settings, [option.key]: checked }),
})

const themeItem = (theme: string) => ({
  type: "radio" as const,
  value: theme,
  checked: props.settings.theme === theme,
  onCheckedChange: () => emit("change", { ...props.settings, theme }),
})
</script>

<template>
  <button v-bind="api.getTriggerProps()">View</button>
  <Teleport v-if="api.open" to="#teleports">
    <div v-bind="api.getPositionerProps()">
      <div v-bind="api.getContentProps()">
        <div v-for="option in checkboxes" :key="option.value" v-bind="api.getOptionItemProps(checkboxItem(option))">
          <span class="check">
            <span v-bind="api.getItemIndicatorProps(checkboxItem(option))">✓</span>
          </span>
          <span v-bind="api.getItemTextProps(checkboxItem(option))">{{ option.label }}</span>
        </div>
        <hr v-bind="api.getSeparatorProps()" />
        <div v-bind="api.getItemGroupProps({ id: 'theme' })">
          <span v-bind="api.getItemGroupLabelProps({ htmlFor: 'theme' })">Theme</span>
          <div v-for="theme in themes" :key="theme" v-bind="api.getOptionItemProps(themeItem(theme))">
            <span class="check">
              <span v-bind="api.getItemIndicatorProps(themeItem(theme))">✓</span>
            </span>
            <span v-bind="api.getItemTextProps(themeItem(theme))">{{ theme }}</span>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
