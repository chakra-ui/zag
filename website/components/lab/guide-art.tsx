"use client"

import type { ComponentType } from "react"
import type { DiagramKey } from "./guide-copy"
import { HeroAnatomy } from "./hero-anatomy"
import { HeroIsoKeys } from "./hero-iso-keys"
import { HeroStatefloor } from "./hero-statefloor"
import { IsoA11y } from "./iso-a11y"
import { IsoAdapters } from "./iso-adapters"
import { GuideLogo } from "./iso-logo"
import { IsoPrinciples } from "./iso-principles"
import { IsoStyling } from "./iso-styling"

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
