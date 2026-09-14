<script lang="ts">
  import * as wheelPicker from "@zag-js/wheel-picker"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  const numbers = (length: number, add = 0) =>
    wheelPicker.collection({
      items: Array.from({ length }, (_, i) => ({ label: String(i + add).padStart(2, "0"), value: String(i + add) })),
    })
  const hour = numbers(12, 1),
    minute = numbers(60),
    period = wheelPicker.collection({ items: ["AM", "PM"].map((value) => ({ label: value, value })) })
  const id = $props.id()
  const hourService = useMachine(wheelPicker.machine, {
    id: `${id}:hour`,
    collection: hour,
    defaultValue: "9",
    infinite: true,
  })
  const minuteService = useMachine(wheelPicker.machine, {
    id: `${id}:minute`,
    collection: minute,
    defaultValue: "41",
    infinite: true,
  })
  const periodService = useMachine(wheelPicker.machine, { id: `${id}:period`, collection: period, defaultValue: "AM" })
  const pickers = $derived([
    { label: "Hour", api: wheelPicker.connect(hourService, normalizeProps) },
    { label: "Minute", api: wheelPicker.connect(minuteService, normalizeProps) },
    { label: "Meridiem", api: wheelPicker.connect(periodService, normalizeProps) },
  ])
</script>

<main class="wheel-picker">
  <div class="wheel-picker-group" role="group" aria-label="Time">
    {#each pickers as { label, api }}<div {...api.getRootProps()}>
        <label class="sr-only" {...api.getLabelProps()}>{label}</label>
        <div {...api.getControlProps()}>
          <div {...api.getViewportProps()}>
            <ul {...api.getItemGroupProps()}>
              {#each api.items as { item, index, key } (key)}<li {...api.getItemProps({ item, index })}>
                  {item.label}
                </li>{/each}
            </ul>
            <div {...api.getHighlightProps()}>
              <ul {...api.getHighlightItemGroupProps()}>
                {#each api.highlightItems as { item, index, key } (key)}<li
                    {...api.getHighlightItemProps({ item, index })}
                  >
                    {item.label}
                  </li>{/each}
              </ul>
            </div>
          </div>
        </div>
      </div>{/each}
  </div>
  <output>Selected time: {pickers.map((picker) => picker.api.valueAsString).join(":")}</output>
</main>
