import { useEffect, useLayoutEffect } from "preact/hooks"

export const useSafeLayoutEffect = typeof document !== "undefined" ? useLayoutEffect : useEffect
