export type JsonNodeType =
  | "object"
  | "array"
  | "primitive"
  | "null"
  | "set"
  | "map"
  | "weakset"
  | "weakmap"
  | "regex"
  | "date"
  | "undefined"
  | "symbol"
  | "bigint"
  | "arraybuffer"
  | "sharedarraybuffer"
  | "buffer"
  | "dataview"
  | "blob"
  | "file"
  | "url"
  | "urlsearchparams"
  | "formdata"
  | "promise"
  | "headers"
  | "int8array"
  | "uint8array"
  | "uint8clampedarray"
  | "int16array"
  | "uint16array"
  | "int32array"
  | "uint32array"
  | "float32array"
  | "float64array"
  | "bigint64array"
  | "biguint64array"
  | "iterable"
  | "error"
  | "function"
  | "circular"

export type JsonNodeKeyPath = (string | number)[]

export type JsonNodeSyntaxKind =
  | "constructor"
  | "brace"
  | "preview"
  | "preview-text"
  | "function-type"
  | "function-body"
  | "colon"
  | "circular"
  | "operator"
  | "error-stack"

export interface JsonNodeElement {
  type: "span" | "div" | "a"
  props: {
    root?: boolean
    nodeType?: string
    kind?: JsonNodeSyntaxKind
    children: string | number | boolean | null | undefined | JsonNodeElement[]
  }
}

export interface JsonNode<T = any> {
  id: string
  key?: string | undefined
  value: T
  type: JsonNodeType
  constructorName?: string | undefined
  isNonEnumerable?: boolean
  propertyDescriptor?: PropertyDescriptor | undefined
  children?: JsonNode[]
  keyPath?: JsonNodeKeyPath | undefined
  dataTypePath?: string | undefined
}
