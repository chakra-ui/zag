import { useEffect, useLayoutEffect } from "react"

export const useSafeLayoutEffect = typeof globalThis !== "undefined" ? useLayoutEffect : useEffect
