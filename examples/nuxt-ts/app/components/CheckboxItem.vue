<script setup lang="ts">
import * as checkbox from "@zag-js/checkbox"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { CheckIcon, MinusIcon } from "lucide-vue-next"

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    label: string
    description?: string
    name?: string
    value?: string
    checked?: checkbox.CheckedState
    defaultChecked?: checkbox.CheckedState
    disabled?: boolean
    readOnly?: boolean
    invalid?: boolean
    required?: boolean
  }>(),
  {
    checked: undefined,
    defaultChecked: undefined,
    disabled: undefined,
    readOnly: undefined,
    invalid: undefined,
    required: undefined,
  },
)

const emit = defineEmits<{ checkedChange: [details: checkbox.CheckedChangeDetails] }>()

const attrs = useAttrs()

const id = useId()
const service = useMachine(
  checkbox.machine,
  computed(() => ({
    id,
    defaultChecked: props.defaultChecked,
    name: props.name,
    value: props.value,
    checked: props.checked,
    disabled: props.disabled,
    readOnly: props.readOnly,
    invalid: props.invalid,
    required: props.required,
    onCheckedChange(details) {
      emit("checkedChange", details)
    },
  })),
)

const api = computed(() => checkbox.connect(service, normalizeProps))
</script>

<template>
  <label v-bind="api.getRootProps()">
    <div v-bind="api.getControlProps()">
      <span v-bind="api.getIndicatorProps()">
        <MinusIcon v-if="api.indeterminate" />
        <CheckIcon v-else />
      </span>
    </div>
    <span v-bind="api.getLabelProps()">
      {{ label }}
      <span v-if="description" class="checkbox-description">{{ description }}</span>
    </span>
    <input v-bind="api.getHiddenInputProps()" :data-testid="attrs['data-testid']" />
  </label>
</template>
