/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Select, items } from "../../components/select"

export default function Page() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const selectedCountry = searchParams.get("country")

  console.log("search param value:", selectedCountry)

  return (
    <div style={{ padding: "40px" }}>
      <h1>{selectedCountry}</h1>

      <button
        onClick={() => {
          router.push(`${pathname}?country=${items[0].value}`)
        }}
      >
        Change to {items[0].label}
      </button>

      <button
        onClick={() => {
          router.push(`${pathname}?country=${items[1].value}`)
        }}
      >
        Change to {items[1].label}
      </button>

      <Select
        positioning={{ placement: "right-end" }}
        value={selectedCountry}
        setValue={(value) => {
          router.push(`${pathname}?country=${value}`)
        }}
      />
    </div>
  )
}
