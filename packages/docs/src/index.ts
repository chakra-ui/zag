import apiData from "../data/api.json" with { type: "json" }
import accessibilityData from "../data/accessibility.json" with { type: "json" }
import dataAttrData from "../data/data-attr.json" with { type: "json" }
import cssVarsData from "../data/css-vars.json" with { type: "json" }
import type { AccessibilityDocKey, ApiDocKey, CssVarDocKey, DataAttrDocKey } from "./keys"

export type { AccessibilityDocKey, ApiDocKey, CssVarDocKey, DataAttrDocKey } from "./keys"

// Fails typecheck when keys.ts drifts from the JSON. Run `pnpm document-keys` to regenerate it.
type Same<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false
type Assert<T extends true> = T
type _KeysInSync = [
  Assert<Same<keyof typeof apiData, ApiDocKey>>,
  Assert<Same<keyof typeof accessibilityData, AccessibilityDocKey>>,
  Assert<Same<keyof typeof dataAttrData, DataAttrDocKey>>,
  Assert<Same<keyof typeof cssVarsData, CssVarDocKey>>,
]

/* -----------------------------------------------------------------------------
 * The data attribute documentation
 * -----------------------------------------------------------------------------*/

export interface DataAttrEntry {
  [part: string]: Record<string, string>
}

const dataAttrJson: Record<DataAttrDocKey, DataAttrEntry> = dataAttrData

export function getDataAttrDoc(key: DataAttrDocKey): DataAttrEntry {
  const data = dataAttrJson[key]
  if (!data) {
    throw new Error(`No data attribute data found for ${key}`)
  }
  return data
}

/* -----------------------------------------------------------------------------
 * The CSS variables documentation
 * -----------------------------------------------------------------------------*/

export interface CssVarEntry {
  [part: string]: Record<string, string>
}

const cssVarsJson: Record<CssVarDocKey, CssVarEntry> = cssVarsData

export function getCssVarDoc(key: CssVarDocKey): CssVarEntry {
  const data = cssVarsJson[key]
  if (!data) {
    throw new Error(`No CSS variable data found for ${key}`)
  }
  return data
}

/* -----------------------------------------------------------------------------
 * The keyboard accessibility doc
 * -----------------------------------------------------------------------------*/

interface KeyboardDoc {
  keys: string[]
  description: string
}

export interface AccessibilityDoc {
  keyboard: KeyboardDoc[]
}

const accessibilityJson: Record<AccessibilityDocKey, AccessibilityDoc> = accessibilityData

export function getAccessibilityDoc(key: AccessibilityDocKey): AccessibilityDoc {
  const data = accessibilityJson[key]
  if (!data) {
    throw new Error(`No accessibility data found for ${key}`)
  }
  return data
}

/* -----------------------------------------------------------------------------
 * The Api and Context documentation
 * -----------------------------------------------------------------------------*/

interface Prop {
  type: string
  description: string
  defaultValue?: string | undefined
}

export interface ApiDoc {
  api: {
    [key: string]: Prop
  }
  context: {
    [key: string]: Prop
  }
}

const apiJson: Record<ApiDocKey, ApiDoc> = apiData

export function getApiDoc(key: ApiDocKey): ApiDoc {
  const data = apiJson[key]

  if (!data) {
    throw new Error(`No API data found for ${key}`)
  }

  return data
}

export { accessibilityJson, apiJson, cssVarsJson }

export default apiJson
