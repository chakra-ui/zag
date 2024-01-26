"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/button"
import { Select } from "@/components/select"

/**
 * This page tests that clicking an item should not trigger element behind
 */

export default function Page() {
  const router = useRouter()

  return (
    <div style={{ paddingBlock: "32px", maxWidth: "400px" }}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <h1>Page</h1>

        <Select />

        <Button
          onClick={() => {
            router.push("/")
          }}
        >
          Go to main page
        </Button>
        <Button
          onClick={() => {
            router.push("/")
          }}
        >
          Go to main page
        </Button>
        <Button
          onClick={() => {
            router.push("/")
          }}
        >
          Go to main page
        </Button>
      </div>
    </div>
  )
}
