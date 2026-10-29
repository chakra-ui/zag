<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as tour from "@zag-js/tour"
  import { XIcon } from "lucide-svelte"
  import "@styles/tour.css"

  const steps: tour.StepDetails[] = [
    {
      type: "dialog",
      id: "start",
      title: "Welcome",
      description: "This tour waits for you to type a value before moving forward.",
      actions: [{ label: "Let's go!", action: "next" }],
    },
    {
      id: "input",
      title: "Type something",
      description: 'Type "test" in the input field to continue to the next step.',
      target: () => document.querySelector("[data-id=input]"),
      placement: "bottom",
      effect({ next, show }) {
        show()
        const [promise, cleanup] = tour.waitForElementValue(
          () => document.querySelector("[data-id=input] input"),
          "test",
          {
            timeout: 10000,
          },
        )
        promise
          .then(() => {
            cleanup()
            next()
          })
          .catch(() => {})
        return cleanup
      },
    },
    {
      id: "result",
      title: "Result",
      description: "Great! You typed the correct value. Here's where your result would appear.",
      target: () => document.querySelector("[data-id=result]"),
      placement: "bottom",
      actions: [
        { label: "Previous", action: "previous" },
        { label: "Next", action: "next" },
      ],
    },
    {
      type: "dialog",
      id: "end",
      title: "All done!",
      description: "You've completed the input event tour.",
      actions: [{ label: "Finish", action: "dismiss" }],
    },
  ]

  const id = $props.id()
  const service = useMachine(tour.machine, { id, steps })

  const api = $derived(tour.connect(service, normalizeProps))
</script>

<main>
  <button class="tour-trigger" onclick={() => api.start()}>Start Tour</button>

  <div data-id="result" style="padding: 20px">
    <h3>Result</h3>
    <p>Your input will appear here after the tour.</p>
  </div>

  <div data-id="input" style="padding: 20px">
    <input type="text" placeholder={'Type "test" to continue...'} style="border: 1px solid black; padding: 10px" />
  </div>

  {#if api.step && api.open}
    <Portal>
      {#if api.step.backdrop}
        <div {...api.getBackdropProps()}></div>
      {/if}
      <div {...api.getSpotlightProps()}></div>
      <div {...api.getPositionerProps()}>
        <div {...api.getContentProps()}>
          <button {...api.getCloseTriggerProps()}>
            <XIcon />
          </button>

          {#if api.step.arrow}
            <div {...api.getArrowProps()}>
              <div {...api.getArrowTipProps()}></div>
            </div>
          {/if}

          <div {...api.getProgressTextProps()}>{api.getProgressText()}</div>

          <p {...api.getTitleProps()}>{api.step.title}</p>
          <div {...api.getDescriptionProps()}>{api.step.description}</div>

          {#if api.step.actions}
            <div style="display: flex; gap: 5px">
              {#each api.step.actions as action (action.label)}
                <button {...api.getActionTriggerProps({ action })}>{action.label}</button>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    </Portal>
  {/if}
</main>
