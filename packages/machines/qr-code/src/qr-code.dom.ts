import type { Scope } from "@zag-js/core"

export const getRootId = (scope: Scope) => scope.ids?.root ?? `qrcode:${scope.id}:root`
export const getFrameId = (scope: Scope) => scope.ids?.frame ?? `qrcode:${scope.id}:frame`
export const getFrameEl = (scope: Scope) => scope.getById<SVGSVGElement>(getFrameId(scope))
