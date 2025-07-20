import { useEffect, useLayoutEffect } from "hono/jsx"

export const useSafeLayoutEffect = typeof globalThis.document !== "undefined" ? useLayoutEffect : useEffect
