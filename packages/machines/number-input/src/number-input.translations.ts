import type { Required } from "@zag-js/types"
import type { IntlTranslations } from "./number-input.types"

export const defaultTranslations: Required<
  Pick<IntlTranslations, "incrementLabel" | "decrementLabel" | "roleDescription">
> = {
  incrementLabel: "increment value",
  decrementLabel: "decrease value",
  roleDescription: "number field",
}
