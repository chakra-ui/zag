type Booleanish = boolean | "true" | "false"

export const dataAttr = (cond: boolean | undefined) => {
  return (cond ? "" : undefined) as Booleanish
}

export const ariaAttr = (cond: boolean | undefined) => {
  return cond ? true : undefined
}

type Dict = Record<string, any>

export interface PropNormalizer {
  <T extends Dict = Dict, R extends Dict = Dict>(props: T): R
}

//@ts-ignore
export const defaultPropNormalizer: PropNormalizer = (props: Dict) => props
