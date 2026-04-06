import type { Scope } from "@zag-js/core"
import { parts } from "./qr-code.anatomy"

// ID generators — kept for ARIA attributes in connect
export const getRootId = (scope: Scope) => scope.ids?.root ?? `${scope.id}:root`
export const getFrameId = (scope: Scope) => scope.ids?.frame ?? `${scope.id}:frame`

// Element lookups — use querySelector with merged data attributes
export const getFrameEl = (scope: Scope) => scope.query<SVGSVGElement>(scope.selector(parts.frame))
