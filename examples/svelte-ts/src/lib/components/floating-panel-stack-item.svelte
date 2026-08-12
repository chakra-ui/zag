<script lang="ts">
  import * as floatingPanel from "@zag-js/floating-panel"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { XIcon } from "lucide-svelte"

  interface Props {
    name: string
    offset: number
  }

  const { name, offset }: Props = $props()

  const id = $props.id()
  const service = useMachine(floatingPanel.machine, {
    id,
    defaultPosition: { x: 100 + offset, y: 100 + offset },
  })

  const api = $derived(floatingPanel.connect(service, normalizeProps))
</script>

<div>
  <button {...api.getTriggerProps()} data-testid={`trigger-${name}`}>
    Toggle {name}
  </button>
  <div {...api.getPositionerProps()} data-testid={`positioner-${name}`}>
    <div {...api.getContentProps()} data-testid={`content-${name}`}>
      <div {...api.getDragTriggerProps()}>
        <div {...api.getHeaderProps()}>
          <p {...api.getTitleProps()}>Panel {name}</p>
          <div {...api.getControlProps()}>
            <button {...api.getCloseTriggerProps()} data-testid={`close-${name}`}>
              <XIcon />
            </button>
          </div>
        </div>
      </div>
      <div {...api.getBodyProps()}>
        <p>Content {name}</p>
      </div>
    </div>
  </div>
</div>
