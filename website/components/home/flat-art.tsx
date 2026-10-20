"use client"

import type { ComponentType } from "react"
import type { DiagramKey } from "components/lab/guide-copy"
import {
  FlatAnatomy,
  FlatEvents,
  FlatMachines,
  FlatPrinciples,
} from "./flat-flow"
import { FlatMiniArt } from "./flat-mini"
import { FlatA11y, FlatAdapters, FlatStyling } from "./flat-parts"

export const flatArt: Record<DiagramKey, ComponentType> = {
  principles: FlatPrinciples,
  machines: FlatMachines,
  events: FlatEvents,
  anatomy: FlatAnatomy,
  adapters: FlatAdapters,
  a11y: FlatA11y,
  styling: FlatStyling,
}

export function FlatMini(props: { kind: DiagramKey }) {
  return <FlatMiniArt kind={props.kind} />
}
