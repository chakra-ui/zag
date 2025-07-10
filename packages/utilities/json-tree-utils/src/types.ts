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

export interface JsonNodePreviewOptions {
  maxPreviewItems: number
  collapseStringsAfterLength: number
}

export interface JsonDataTypeOptions<T = unknown> {
  type: JsonNodeType | ((value: T) => JsonNodeType)
  check(value: unknown): boolean
  node: JsonNodeCreatorFn<T>
  description: string | ((node: JsonNode<T>, opts: JsonNodePreviewOptions) => string)
  previewText?: (node: JsonNode<T>, opts: JsonNodePreviewOptions) => string
  previewElement(node: JsonNode<T>, opts: JsonNodePreviewOptions): JsonNodeElement
}

export interface JsonNodeCreatorParams<T = unknown> {
  value: T
  id: string
  visited: WeakSet<WeakKey>
  parentKey: string
  keyPath: Array<string | number>
  dataTypePath: string
  createNode(
    value: unknown,
    key: string,
    id?: string,
    visited?: WeakSet<WeakKey>,
    keyPath?: Array<string | number>,
    dataTypePath?: string,
  ): JsonNode
}

export interface JsonNodeCreatorFn<T = unknown> {
  (opts: JsonNodeCreatorParams<T>): JsonNode
}
