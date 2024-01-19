"use client"

import { Dialog } from "@/components/dialog"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

export default function Page() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const showDialog = searchParams.get("show-dialog") === "true"

  return (
    <div style={{ padding: "40px" }}>
      <h1>Dialog Search Params</h1>

      <h1>{String(showDialog)}</h1>

      <button
        onClick={() => {
          router.push(`${pathname}?show-dialog=true`)
        }}
      >
        Open
      </button>

      <button
        onClick={() => {
          router.push(`${pathname}?show-dialog=false`)
        }}
      >
        Close
      </button>

      <Dialog
        open={showDialog}
        onOpenChange={({ open }) => {
          router.push(`${pathname}?show-dialog=${open}`)
        }}
      />
    </div>
  )
}
