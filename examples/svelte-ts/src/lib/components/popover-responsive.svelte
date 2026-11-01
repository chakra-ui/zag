<script lang="ts">
  import * as popover from "@zag-js/popover"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { XIcon } from "lucide-svelte"
  import Portal from "./portal.svelte"

  const dataAttr = (el: HTMLElement, key: string, value: boolean) => {
    if (value) el.dataset[key] = ""
    else delete el.dataset[key]
  }

  const isMdDown = () => window.matchMedia("(max-width: 640px)").matches

  const id = $props.id()
  const service = useMachine(popover.machine, {
    id,
    positioning: {
      updatePosition({ updatePosition, floatingElement }) {
        const positionerEl = floatingElement as HTMLElement
        const contentEl = positionerEl.firstElementChild as HTMLElement

        dataAttr(positionerEl, "fullscreen", isMdDown())
        dataAttr(contentEl, "fullscreen", isMdDown())

        updatePosition()
      },
    },
  })

  const api = $derived(popover.connect(service, normalizeProps))
</script>

<main>
  <button {...api.getTriggerProps()}>Click me</button>
  <Portal>
    <div {...api.getPositionerProps()}>
      <div {...api.getContentProps()}>
        <div {...api.getTitleProps()}>Presenters</div>
        <div {...api.getDescriptionProps()}>Description</div>
        <button>Action Button</button>
        <button {...api.getCloseTriggerProps()}>
          <XIcon />
        </button>
      </div>
    </div>
  </Portal>
</main>
