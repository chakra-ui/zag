"use client"

import * as avatar from "@zag-js/avatar"
import { mergeProps, normalizeProps, Portal, useMachine } from "@zag-js/react"
import * as tooltip from "@zag-js/tooltip"
import { avatarData } from "@zag-js/shared"
import { useId } from "react"
import { Presence } from "@/components/presence"
import "@styles/avatar.css"
import "@styles/tooltip.css"

const triggerStyle = {
  border: "none",
  background: "none",
  padding: 0,
  borderRadius: "9999px",
  cursor: "pointer",
}

export default function Page() {
  const avatarService = useMachine(avatar.machine, { id: useId() })
  const avatarApi = avatar.connect(avatarService, normalizeProps)

  const tooltipService = useMachine(tooltip.machine, { id: useId() })
  const tooltipApi = tooltip.connect(tooltipService, normalizeProps)

  return (
    <main className="avatar">
      {/* The button is both the tooltip trigger and the avatar root */}
      <button
        {...mergeProps(tooltipApi.getTriggerProps(), avatarApi.getRootProps())}
        data-size="sm"
        style={triggerStyle}
      >
        <span {...avatarApi.getFallbackProps()}>PA</span>
        <img alt="" referrerPolicy="no-referrer" src={avatarData.full[0]} {...avatarApi.getImageProps()} />
      </button>

      <Portal>
        <div {...tooltipApi.getPositionerProps()}>
          <Presence className="tooltip-content" {...tooltipApi.getContentProps()}>
            Naruto Uzumaki
          </Presence>
        </div>
      </Portal>
    </main>
  )
}
