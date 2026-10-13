import * as avatar from "@zag-js/avatar"
import { avatarData } from "@zag-js/shared"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import * as tooltip from "@zag-js/tooltip"
import { createMemo, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import { Presence } from "~/components/presence"
import "@styles/avatar.css"
import "@styles/tooltip.css"

const triggerStyle = {
  border: "none",
  background: "none",
  padding: "0",
  "border-radius": "9999px",
  cursor: "pointer",
}

export default function Page() {
  const avatarService = useMachine(avatar.machine, { id: createUniqueId() })
  const avatarApi = createMemo(() => avatar.connect(avatarService, normalizeProps))

  const tooltipService = useMachine(tooltip.machine, { id: createUniqueId() })
  const tooltipApi = createMemo(() => tooltip.connect(tooltipService, normalizeProps))

  return (
    <main class="avatar">
      {/* The button is both the tooltip trigger and the avatar root */}
      <button
        {...mergeProps(tooltipApi().getTriggerProps(), avatarApi().getRootProps())}
        data-size="sm"
        style={triggerStyle}
      >
        <span {...avatarApi().getFallbackProps()}>PA</span>
        <img alt="" referrerPolicy="no-referrer" src={avatarData.full[0]} {...avatarApi().getImageProps()} />
      </button>

      <Portal>
        <div {...tooltipApi().getPositionerProps()}>
          <Presence class="tooltip-content" {...tooltipApi().getContentProps()}>
            Naruto Uzumaki
          </Presence>
        </div>
      </Portal>
    </main>
  )
}
