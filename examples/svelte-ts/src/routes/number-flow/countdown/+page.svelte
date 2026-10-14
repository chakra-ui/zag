<script lang="ts">
  import NumberFlow from "$lib/components/number-flow.svelte"
  import "@styles/number-flow.css"

  const START = 90 * 60

  const twoDigits = { minimumIntegerDigits: 2 }

  let seconds = $state(START)
  let running = $state(true)

  $effect(() => {
    if (!running) return
    const id = setInterval(() => (seconds = Math.max(0, seconds - 1)), 1000)
    return () => clearInterval(id)
  })

  const units = $derived([
    { label: "Hours", value: Math.floor(seconds / 3600) },
    { label: "Minutes", value: Math.floor((seconds % 3600) / 60) },
    { label: "Seconds", value: seconds % 60 },
  ])
</script>

<main class="number-flow">
  <div class="nf-countdown" role="timer">
    {#each units as unit, index (unit.label)}
      <div class="hstack gap-1 items-start">
        {#if index > 0}
          <span class="nf-colon">:</span>
        {/if}
        <div class="nf-unit">
          <!-- trend -1: digits always roll downward, like a clock counting down -->
          <NumberFlow value={unit.value} formatOptions={twoDigits} trend={-1} />
          <small>{unit.label}</small>
        </div>
      </div>
    {/each}
  </div>

  <div class="hstack">
    <button onclick={() => (running = !running)}>{running ? "Pause" : "Start"}</button>
    <button onclick={() => (seconds = START)}>Reset</button>
  </div>
</main>
