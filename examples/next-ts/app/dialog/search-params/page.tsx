"use client"

import * as dialog from "@zag-js/dialog"
import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useId } from "react"
import "@styles/dialog.css"

export default function Page() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const showDialog = searchParams.get("show-dialog") === "true"

  const service = useMachine(dialog.machine, {
    id: useId(),
    open: showDialog,
    onOpenChange: (details) => {
      router.push(`${pathname}?show-dialog=${details.open}`)
    },
  })

  const api = dialog.connect(service, normalizeProps)

  return (
    <div style={{ padding: "40px", height: "200vh" }}>
      <h1>Dialog Search Params</h1>
      <h1>{String(showDialog)}</h1>

      <button onClick={() => router.push(`${pathname}?show-dialog=true`)}>Open</button>
      <button onClick={() => router.push(`${pathname}?show-dialog=false`)}>Close</button>

      <button {...api.getTriggerProps()}>Open Dialog</button>
      {api.open && (
        <Portal>
          <div {...api.getBackdropProps()} />
          <div {...api.getPositionerProps()}>
            <div {...api.getContentProps()}>
              <h2 {...api.getTitleProps()}>Edit profile</h2>
              <p {...api.getDescriptionProps()}>Make changes to your profile here. Click save when you are done.</p>
              <div>
                <input placeholder="Enter name..." />
                <button>Save</button>
              </div>
              <button {...api.getCloseTriggerProps()}>Close</button>
            </div>
          </div>
        </Portal>
      )}
    </div>
  )
}
