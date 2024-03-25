import apiJson from "../data/api.json"
import accessibilityJson from "../data/accessibility.json"

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

export type AccessibilityDocKey = keyof typeof accessibilityJson

export function getAccessibilityDoc(key: AccessibilityDocKey): AccessibilityDoc {
  const data = accessibilityJson[key]
  if (!data) {
    throw new Error(`No accessibility data found for ${key}`)
  }
  return data as AccessibilityDoc
}

/* -----------------------------------------------------------------------------
 * The Api and Context documentation
 * -----------------------------------------------------------------------------*/

interface Prop {
  type: string
  description: string
  defaultValue?: string
}

export interface ApiDoc {
  api: {
    [key: string]: Prop
  }
  context: {
    [key: string]: Prop
  }
}

export type ApiDocKey = keyof typeof apiJson

export function getApiDoc(key: ApiDocKey): ApiDoc {
  const data = apiJson[key]

  if (!data) {
    throw new Error(`No API data found for ${key}`)
  }

  return data as ApiDoc
}

export { accessibilityJson, apiJson }

export default apiJson
