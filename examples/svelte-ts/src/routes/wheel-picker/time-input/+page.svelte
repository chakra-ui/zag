<script lang="ts">
  import * as dateInput from "@zag-js/date-input"
  import * as popover from "@zag-js/popover"
  import * as wheelPicker from "@zag-js/wheel-picker"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  const numbers = (length: number, add = 0) =>
    wheelPicker.collection({
      items: Array.from({ length }, (_, i) => ({ label: String(i + add).padStart(2, "0"), value: String(i + add) })),
    })

  const id = $props.id()
  let value = $state<dateInput.DateValue[]>([])
  let hour = $state("12")
  let minute = $state("00")
  let dayPeriod = $state("am")

  const hourCollection = numbers(12, 1)
  const minuteCollection = numbers(60)
  const periodCollection = wheelPicker.collection({
    items: [
      { label: "AM", value: "am" },
      { label: "PM", value: "pm" },
    ],
  })

  const dateService = useMachine(dateInput.machine, () => ({
    id: `${id}:input`,
    locale: "en-US",
    granularity: "minute" as const,
    maxGranularity: "hour" as const,
    shouldForceLeadingZeros: true,
    value,
    onValueChange: (details) => (value = details.value),
  }))
  const popoverService = useMachine(popover.machine, {
    id: `${id}:popover`,
    positioning: { placement: "bottom" },
    modal: true,
  })
  const dateApi = $derived(dateInput.connect(dateService, normalizeProps))
  const popoverApi = $derived(popover.connect(popoverService, normalizeProps))

  function updateTime() {
    const current = dateApi.value[0] ?? dateApi.placeholderValue
    if (!("hour" in current)) return
    value = [current.set({ hour: (Number(hour) % 12) + (dayPeriod === "pm" ? 12 : 0), minute: Number(minute) })]
  }

  const hourService = useMachine(wheelPicker.machine, () => ({
    id: `${id}:hour`,
    collection: hourCollection,
    value: hour,
    infinite: true,
    onValueChange: (details) => {
      if (details.value) {
        hour = details.value
        updateTime()
      }
    },
  }))
  const minuteService = useMachine(wheelPicker.machine, () => ({
    id: `${id}:minute`,
    collection: minuteCollection,
    value: minute,
    infinite: true,
    onValueChange: (details) => {
      if (details.value) {
        minute = details.value
        updateTime()
      }
    },
  }))
  const periodService = useMachine(wheelPicker.machine, () => ({
    id: `${id}:period`,
    collection: periodCollection,
    value: dayPeriod,
    onValueChange: (details) => {
      if (details.value) {
        dayPeriod = details.value
        updateTime()
      }
    },
  }))
  const pickers = $derived([
    { label: "Hour", api: wheelPicker.connect(hourService, normalizeProps) },
    { label: "Minute", api: wheelPicker.connect(minuteService, normalizeProps) },
    { label: "Day period", api: wheelPicker.connect(periodService, normalizeProps) },
  ])
</script>

<main class="date-input wheel-picker wheel-picker-time-input">
  <div {...dateApi.getRootProps()}>
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label {...dateApi.getLabelProps()}>Time</label>
    <div class="wheel-picker-time-field" {...popoverApi.getAnchorProps()}>
      <div {...dateApi.getControlProps()}>
        <div {...dateApi.getSegmentGroupProps()}>
          {#each dateApi.getSegments() as segment}<span {...dateApi.getSegmentProps({ segment })}>{segment.text}</span
            >{/each}
        </div>
      </div>
      <button aria-label="Open time picker" {...popoverApi.getTriggerProps()}>🕘</button>
    </div>
    <input {...dateApi.getHiddenInputProps()} />
  </div>

  <div {...popoverApi.getPositionerProps()}>
    <div class="wheel-picker-time-content" {...popoverApi.getContentProps()}>
      <div class="sr-only" {...popoverApi.getTitleProps()}>Select time</div>
      <div class="wheel-picker-group" role="group" aria-label="Time picker">
        {#each pickers as { label, api }}
          <div {...api.getRootProps()}>
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
          </div>
        {/each}
      </div>
    </div>
  </div>
  <output data-testid="value">Selected time: {dateApi.valueAsString[0] ?? "-"}</output>
</main>
