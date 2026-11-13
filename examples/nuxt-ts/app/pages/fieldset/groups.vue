<script setup lang="ts">
import { getEventTarget } from "@zag-js/dom-query"
import * as field from "@zag-js/field"
import * as fieldsetMachine from "@zag-js/fieldset"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/field.css"

type GroupName = "plan" | "notify"

const groups = [
  {
    name: "plan" as GroupName,
    type: "radio",
    legend: "Plan",
    error: "Choose a plan",
    options: [
      { value: "free", label: "Free" },
      { value: "pro", label: "Pro" },
      { value: "team", label: "Team" },
    ],
  },
  {
    name: "notify" as GroupName,
    type: "checkbox",
    legend: "Notify me by",
    error: "Pick at least one channel",
    options: [
      { value: "email", label: "Email" },
      { value: "sms", label: "SMS" },
      { value: "push", label: "Push" },
    ],
  },
]

const errors = ref<Record<GroupName, boolean>>({ plan: false, notify: false })
const status = ref("")

const fieldsets = groups.map((group) => {
  const id = useId()
  const service = useMachine(
    fieldsetMachine.machine,
    computed(() => ({ id, invalid: errors.value[group.name] })),
  )
  return computed(() => fieldsetMachine.connect(service, normalizeProps))
})

const fields = groups.map((group) =>
  group.options.map(() => {
    const service = useMachine(field.machine, { id: useId() })
    return computed(() => field.connect(service, normalizeProps))
  }),
)

const onChange = (event: Event) => {
  const target = getEventTarget<HTMLInputElement>(event)
  if (target) errors.value = { ...errors.value, [target.name]: false }
}

const onSubmit = (event: Event) => {
  const form = event.currentTarget as HTMLFormElement
  const data = new FormData(form)
  const next = { plan: !data.get("plan"), notify: data.getAll("notify").length === 0 }
  errors.value = next
  const firstInvalid = next.plan ? "plan" : next.notify ? "notify" : null
  if (firstInvalid) form.querySelector<HTMLInputElement>(`input[name="${firstInvalid}"]`)?.focus()
  status.value = firstInvalid ? "" : "Submitted!"
}
</script>

<template>
  <main class="field-page">
    <form @change="onChange" @submit.prevent="onSubmit">
      <fieldset v-for="(group, i) in groups" :key="group.name" v-bind="fieldsets[i].value.getRootProps()">
        <legend v-bind="fieldsets[i].value.getLegendProps()">{{ group.legend }}</legend>
        <div
          v-for="(option, j) in group.options"
          :key="option.value"
          v-bind="fields[i][j].value.getRootProps()"
          class="field-option"
        >
          <input
            v-bind="fields[i][j].value.getInputProps()"
            :type="group.type"
            :name="group.name"
            :value="option.value"
          />
          <label v-bind="fields[i][j].value.getLabelProps()">{{ option.label }}</label>
        </div>
        <span v-bind="fieldsets[i].value.getErrorTextProps()">{{ group.error }}</span>
      </fieldset>

      <div class="actions">
        <button type="submit">Save</button>
      </div>
      <output data-testid="status">{{ status }}</output>
    </form>
  </main>
</template>
