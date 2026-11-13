<script lang="ts">
  import { getEventTarget } from "@zag-js/dom-query"
  import * as field from "@zag-js/field"
  import * as fieldsetMachine from "@zag-js/fieldset"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
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

  const id = $props.id()

  let errors = $state<Record<GroupName, boolean>>({ plan: false, notify: false })
  let status = $state("")

  const fieldsetServices = groups.map((group) =>
    useMachine(fieldsetMachine.machine, () => ({ id: `${id}-${group.name}`, invalid: errors[group.name] })),
  )
  const fieldsets = $derived(fieldsetServices.map((service) => fieldsetMachine.connect(service, normalizeProps)))

  const fieldServices = groups.map((group) =>
    group.options.map((option) => useMachine(field.machine, { id: `${id}-${group.name}-${option.value}` })),
  )
  const fields = $derived(
    fieldServices.map((services) => services.map((service) => field.connect(service, normalizeProps))),
  )

  const onChange = (event: Event) => {
    const target = getEventTarget<HTMLInputElement>(event)
    if (target) errors = { ...errors, [target.name]: false }
  }

  const onSubmit = (event: SubmitEvent) => {
    event.preventDefault()
    const form = event.currentTarget as HTMLFormElement
    const data = new FormData(form)
    const next = { plan: !data.get("plan"), notify: data.getAll("notify").length === 0 }
    errors = next
    const firstInvalid = next.plan ? "plan" : next.notify ? "notify" : null
    if (firstInvalid) form.querySelector<HTMLInputElement>(`input[name="${firstInvalid}"]`)?.focus()
    status = firstInvalid ? "" : "Submitted!"
  }
</script>

<main class="field-page">
  <form onchange={onChange} onsubmit={onSubmit}>
    {#each groups as group, i (group.name)}
      <fieldset {...fieldsets[i].getRootProps()}>
        <legend {...fieldsets[i].getLegendProps()}>{group.legend}</legend>
        {#each group.options as option, j (option.value)}
          <div {...fields[i][j].getRootProps()} class="field-option">
            <input {...fields[i][j].getInputProps()} type={group.type} name={group.name} value={option.value} />
            <label {...fields[i][j].getLabelProps()}>{option.label}</label>
          </div>
        {/each}
        <span {...fieldsets[i].getErrorTextProps()}>{group.error}</span>
      </fieldset>
    {/each}

    <div class="actions">
      <button type="submit">Save</button>
    </div>
    <output data-testid="status">{status}</output>
  </form>
</main>
