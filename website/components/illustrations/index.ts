"use client"

import type { ComponentType } from "react"
import type { DiagramKey } from "./types"
import { HeroAnatomy } from "./anatomy"
import { HeroIsoKeys } from "./keys"
import { HeroStatefloor } from "./statefloor"
import { IsoA11y } from "./a11y"
import { IsoAdapters } from "./adapters"
import { GuideLogo } from "./logo"
import { IsoPrinciples } from "./principles"
import { IsoStyling } from "./styling"

export { GuideLogo }

export const guideArt: Record<DiagramKey, ComponentType> = {
  principles: IsoPrinciples,
  machines: HeroStatefloor,
  events: HeroIsoKeys,
  anatomy: HeroAnatomy,
  adapters: IsoAdapters,
  a11y: IsoA11y,
  styling: IsoStyling,
}
