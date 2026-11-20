<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as timer from "@zag-js/timer"
  import "@styles/timer.css"

  const toMs = (time: timer.Time) =>
    ((time.days * 24 + time.hours) * 60 + time.minutes) * 60_000 + time.seconds * 1000 + time.milliseconds

  let canResend = $state(false)
  let sent = $state(1)

  const id = $props.id()
  const service = useMachine(timer.machine, {
    id,
    countdown: true,
    autoStart: true,
    startMs: 30_000,
    onComplete: () => (canResend = true),
  })
  const api = $derived(timer.connect(service, normalizeProps))
  const secondsLeft = $derived(Math.ceil(toMs(api.time) / 1000))

  function resend() {
    canResend = false
    sent += 1
    api.restart()
  }
</script>

<main>
  <div class="timer-resend-code">
    <div {...api.getRootProps()}>
      <span class="code" aria-hidden="true">••• •••</span>
    </div>
    <button type="button" disabled={!canResend} onclick={resend}>
      {canResend ? "Resend code" : `Resend code in ${secondsLeft}s`}
    </button>
    <p class="sent">Sent {sent} {sent === 1 ? "code" : "codes"}</p>
  </div>
</main>

<Toolbar viz>
  <StateVisualizer state={service} />
</Toolbar>
