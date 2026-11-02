<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import Checkbox from "#lib/components/dialog-focus-checkbox.svelte"
  import RadioGroup from "#lib/components/dialog-focus-radio-group.svelte"
  import Switch from "#lib/components/dialog-focus-switch.svelte"
  import * as dialog from "@zag-js/dialog"
  import * as popover from "@zag-js/popover"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { XIcon } from "lucide-svelte"

  // Clicking a control with the mouse inside a focus-trapped overlay must not set data-focus-visible
  // when focus moves from another control in the same overlay.

  const id = $props.id()

  const dialogService = useMachine(dialog.machine, { id: `${id}-dialog` })
  const dlg = $derived(dialog.connect(dialogService, normalizeProps))

  const popoverService = useMachine(popover.machine, { id: `${id}-popover` })
  const pop = $derived(popover.connect(popoverService, normalizeProps))

  const focusCss = `
    [data-checkbox-root], [data-switch-root], [data-radio-group-item] { padding: 5px; border-radius: 6px; }
    [data-focus-visible] { outline: 3px solid crimson; outline-offset: 2px; background: #ffe9ec; }
  `
</script>

<svelte:head>
  {@html `<style>${focusCss}</style>`}
</svelte:head>

<main style="padding: 40px; font-family: system-ui">
  <h1 style="font-size: 20px; margin-bottom: 16px">focus-visible inside focus traps</h1>

  <section style="margin-bottom: 20px">
    <h2 style="font-size: 14px">Control — no focus trap</h2>
    <Checkbox label="First" testId="out-a" />
    <Checkbox label="Second" testId="out-b" />
  </section>

  <div style="display: flex; gap: 12px">
    <button {...dlg.getTriggerProps()}>Open dialog</button>
    <button {...pop.getTriggerProps()} data-testid="popover-trigger">Open popover</button>
  </div>

  {#if dlg.open}
    <Portal>
      <div {...dlg.getBackdropProps()} style="position: fixed; inset: 0; background: rgba(0, 0, 0, 0.4)"></div>
      <div {...dlg.getPositionerProps()} style="position: fixed; inset: 0; display: grid; place-items: center">
        <div {...dlg.getContentProps()} style="background: #fff; padding: 24px; border-radius: 8px; min-width: 320px">
          <h2 {...dlg.getTitleProps()} style="font-size: 15px">Dialog</h2>
          <div style="display: grid; gap: 8px; margin: 12px 0">
            <Checkbox label="First" testId="dlg-cb-a" />
            <Checkbox label="Second" testId="dlg-cb-b" />
            <Switch label="Switch A" testId="dlg-sw-a" />
            <Switch label="Switch B" testId="dlg-sw-b" />
            <RadioGroup testId="dlg-radio" />
          </div>
          <button {...dlg.getCloseTriggerProps()}>
            <XIcon />
          </button>
        </div>
      </div>
    </Portal>
  {/if}

  <div {...pop.getPositionerProps()}>
    <div {...pop.getContentProps()} style="background: #fff; border: 1px solid #ccc; padding: 16px">
      <div style="display: grid; gap: 8px">
        <Checkbox label="First" testId="pop-cb-a" />
        <Checkbox label="Second" testId="pop-cb-b" />
      </div>
    </div>
  </div>
</main>
