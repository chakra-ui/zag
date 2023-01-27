import { useEffect, useLayoutEffect } from "react"

export const useSafeLayoutEffect = typeof document !== "undefined" ? useLayoutEffect : useEffect
