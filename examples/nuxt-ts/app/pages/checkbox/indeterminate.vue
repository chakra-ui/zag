<script setup lang="ts">
import * as checkbox from "@zag-js/checkbox"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { CheckIcon, MinusIcon } from "lucide-vue-next"
import "@styles/checkbox.css"

const toppings = ["Cheese", "Mushrooms", "Olives"]

const selected = ref<string[]>(["Cheese"])

// Derived from the children: none, some (indeterminate) or all
const allState = computed<checkbox.CheckedState>(() =>
  selected.value.length === 0 ? false : selected.value.length === toppings.length ? true : "indeterminate",
)

const id = useId()
const service = useMachine(
  checkbox.machine,
  computed(() => ({
    id,
    name: "all",
    checked: allState.value,
    onCheckedChange({ checked }) {
      selected.value = checked === true ? toppings : []
    },
  })),
)

const api = computed(() => checkbox.connect(service, normalizeProps))

const onToppingChange = (topping: string, checked: checkbox.CheckedState) => {
  selected.value = checked ? [...selected.value, topping] : selected.value.filter((item) => item !== topping)
}
</script>

<template>
  <main class="checkbox">
    <div class="vstack gap-3">
      <label v-bind="api.getRootProps()">
        <div v-bind="api.getControlProps()">
          <span v-bind="api.getIndicatorProps()">
            <MinusIcon v-if="api.indeterminate" />
            <CheckIcon v-else />
          </span>
        </div>
        <span v-bind="api.getLabelProps()">All toppings</span>
        <input v-bind="api.getHiddenInputProps()" data-testid="hidden-input" />
      </label>

      <div class="checkbox-children">
        <CheckboxItem
          v-for="topping in toppings"
          :key="topping"
          :label="topping"
          :checked="selected.includes(topping)"
          @checked-change="({ checked }) => onToppingChange(topping, checked)"
        />
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
