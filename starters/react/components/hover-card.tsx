import * as hoverCard from "@zag-js/hover-card"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { useId } from "react"

interface Props extends Omit<hoverCard.Context, "open.controlled" | "id"> {
  defaultOpen?: boolean
}

export function HoverCard(props: Props) {
  const { defaultOpen, open, ...context } = props

  const [state, send] = useMachine(
    hoverCard.machine({
      id: useId(),
      open: open ?? defaultOpen,
    }),
    {
      context: {
        ...context,
        "open.controlled": open !== undefined,
        open,
      },
    },
  )

  const api = hoverCard.connect(state, send, normalizeProps)

  return (
    <main className="hover-card">
      <div style={{ display: "flex", gap: "50px" }}>
        <a href="https://twitter.com/zag_js" target="_blank" {...api.getTriggerProps()}>
          Twitter
        </a>

        {api.open && (
          <Portal>
            <div {...api.getPositionerProps()}>
              <div {...api.getContentProps()}>
                <div {...api.getArrowProps()}>
                  <div {...api.getArrowTipProps()} />
                </div>
                Twitter Preview
                <a href="https://twitter.com/zag_js" target="_blank">
                  Twitter
                </a>
              </div>
            </div>
          </Portal>
        )}
      </div>
    </main>
  )
}
