type Dict = Record<string, any>

export function splitProps<T extends Dict>(props: T, keys: (keyof T)[]) {
  const rest: Dict = {}
  const result: Dict = {}

  const keySet = new Set(keys)

  for (const key in props) {
    if (keySet.has(key)) {
      result[key] = props[key]
    } else {
      rest[key] = props[key]
    }
  }

  return [result, rest]
}

export const createSplitProps = <T extends Dict>(keys: (keyof T)[]) => {
  return function split<Props extends T>(props: Props) {
    return splitProps(props, keys) as [T, Omit<Props, keyof T>]
  }
}
