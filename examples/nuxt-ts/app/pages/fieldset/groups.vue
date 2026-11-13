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

const sections = groups.map((group) => {
  const id = useId()
  const fieldsetService = useMachine(
    fieldsetMachine.machine,
    computed(() => ({ id, invalid: errors.value[group.name] })),
  )
  const options = group.options.map((option) => {
    const service = useMachine(field.machine, { id: useId() })
    return { option, api: computed(() => field.connect(service, normalizeProps)) }
  })
  return { group, options, api: computed(() => fieldsetMachine.connect(fieldsetService, normalizeProps)) }
})

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
      <fieldset v-for="section in sections" :key="section.group.name" v-bind="section.api.value.getRootProps()">
        <legend v-bind="section.api.value.getLegendProps()">{{ section.group.legend }}</legend>
        <div
          v-for="row in section.options"
          :key="row.option.value"
          v-bind="row.api.value.getRootProps()"
          class="field-option"
        >
          <input
            v-bind="row.api.value.getInputProps()"
            :type="section.group.type"
            :name="section.group.name"
            :value="row.option.value"
          />
          <label v-bind="row.api.value.getLabelProps()">{{ row.option.label }}</label>
        </div>
        <span v-bind="section.api.value.getErrorTextProps()">{{ section.group.error }}</span>
      </fieldset>

      <div class="actions">
        <button type="submit">Save</button>
      </div>
      <output data-testid="status">{{ status }}</output>
    </form>
  </main>
</template>
