"use client"

import * as avatar from "@zag-js/avatar"
import * as menu from "@zag-js/menu"
import { mergeProps, normalizeProps, Portal, useMachine } from "@zag-js/react"
import { avatarData } from "@zag-js/shared"
import { useId } from "react"
import "@styles/avatar.css"
import "@styles/menu.css"

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

  const menuService = useMachine(menu.machine, { id: useId(), onSelect: console.log })
  const menuApi = menu.connect(menuService, normalizeProps)

  return (
    <main className="avatar">
      {/* The button is both the menu trigger and the avatar root */}
      <button {...mergeProps(menuApi.getTriggerProps(), avatarApi.getRootProps())} data-size="sm" style={triggerStyle}>
        <span {...avatarApi.getFallbackProps()}>PA</span>
        <img alt="" referrerPolicy="no-referrer" src={avatarData.full[0]} {...avatarApi.getImageProps()} />
      </button>

      {menuApi.open && (
        <Portal>
          <div {...menuApi.getPositionerProps()}>
            <ul {...menuApi.getContentProps()}>
              <li {...menuApi.getItemProps({ value: "profile" })}>Profile</li>
              <li {...menuApi.getItemProps({ value: "settings" })}>Settings</li>
              <li {...menuApi.getItemProps({ value: "signout" })}>Sign out</li>
            </ul>
          </div>
        </Portal>
      )}
    </main>
  )
}
