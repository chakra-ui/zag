<script lang="ts">
  import Output from "$lib/components/output.svelte"
  import * as slider from "@zag-js/slider"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/slider.css"

  const minBudget = 50

  let invalid = $state(false)
  let submitted = $state<Record<string, FormDataEntryValue> | null>(null)

  const id = $props.id()
  const service = useMachine(slider.machine, () => ({
    id,
    name: "budget",
    defaultValue: [20],
    thumbSize: 20,
    invalid,
    onValueChange() {
      invalid = false
    },
  }))

  const api = $derived(slider.connect(service, normalizeProps))

  function onsubmit(event: SubmitEvent & { currentTarget: HTMLFormElement }) {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(event.currentTarget))
    if (Number(data.budget) < minBudget) {
      invalid = true
      return
    }
    submitted = data
  }

  function onreset() {
    invalid = false
    submitted = null
  }
</script>

<main>
  <form class="vstack gap-4" {onsubmit} {onreset}>
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>Budget</label>
      <output {...api.getValueTextProps()}>${api.value[0]}</output>
      <div {...api.getControlProps()}>
        <div {...api.getTrackProps()}>
          <div {...api.getRangeProps()}></div>
        </div>
        {#each api.value as _, index}
          <div {...api.getThumbProps({ index })}>
            <input {...api.getHiddenInputProps({ index })} />
          </div>
        {/each}
      </div>
    </div>
    {#if invalid}
      <p class="slider-error">Budget must be at least ${minBudget}</p>
    {/if}
    <div class="hstack">
      <button type="submit">Submit</button>
      <button type="reset">Reset</button>
    </div>
  </form>
  <Output label="Submitted" value={submitted ?? "—"} />
</main>
