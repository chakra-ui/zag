import { getPreviewOptions, keyPathToKey } from "./node-conversion"
import { getNonEnumerableKeys, getProp, isObj, take, typeOf } from "./shared"
import type {
  JsonDataTypeOptions,
  JsonNode,
  JsonNodeCreatorFn,
  JsonNodeCreatorParams,
  JsonNodeElement,
  JsonNodeHastElement,
  JsonNodeKeyPath,
  JsonNodePreviewOptions,
  JsonNodeSyntaxKind,
  JsonNodeText,
  JsonNodeType,
} from "./types"

const ENTRIES_KEY = "[[Entries]]"
const NOT_ENUMERABLE = " [[Entries]]: not enumerable "
const CIRCULAR = "[Circular]"

/* -----------------------------------------------------------------------------
 * Preview elements: hast-compatible spans
 * -----------------------------------------------------------------------------*/

type Child = JsonNodeElement | JsonNodeText

const txt = (value: JsonNodeText["value"]): JsonNodeText => ({ type: "text", value })

const span = (properties: JsonNodeElement["properties"] = {}, children: Child[] = []): JsonNodeElement => ({
  type: "element",
  tagName: "span",
  properties,
  children,
})

/** A span holding one piece of text, tagged with its syntax kind */
const part = (text: string, kind?: JsonNodeSyntaxKind) => span(kind ? { kind } : {}, [txt(text)])

/** `Constructor`, an opening brace, a preview and a closing brace */
const shell = (constructor: string, open: string, text: string, close: string, kind: JsonNodeSyntaxKind = "preview") =>
  span({}, [part(constructor, "constructor"), part(open, "brace"), part(text, kind), part(close, "brace")])

/** Like `shell`, but the constructor and preview are left out when empty */
function braced(constructor: string | undefined, open: string, preview: string, close: string) {
  const children: Child[] = []
  if (constructor) children.push(part(constructor, "constructor"))
  children.push(part(open, "brace"))
  if (preview) children.push(part(preview, "preview-text"))
  children.push(part(close, "brace"))
  return span({}, children)
}

// nothing to show reads as `{}` rather than `{  }`
const previewList = (items: string[], hasMore: boolean) =>
  items.length === 0 && !hasMore ? "" : ` ${items.join(", ")}${hasMore ? ", … " : " "}`

const more = (hasMore: boolean) => (hasMore ? ", …" : "")

const formatValueMini = (child: JsonNode): string => {
  switch (child.type) {
    case "string":
      return `"${child.value}"`
    case "null":
      return "null"
    case "undefined":
    case "symbol":
      return "undefined"
    case "object":
      return "{…}"
    case "array":
      return "[…]"
    case "set":
      return "Set(…)"
    case "map":
      return "Map(…)"
    case "iterable":
      return "Iterable(…)"
    case "function":
      return "ƒ(…)"
    default:
      return String(child.value)
  }
}

const formatValue = (value: unknown): string => {
  if (value === null) return "null"
  if (value === undefined) return "undefined"
  if (typeof value === "string") return `"${value}"`
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  if (value instanceof Date) return value.toISOString()
  if (value instanceof Set) return `Set(${value.size})`
  if (value instanceof Map) return `Map(${value.size})`
  if (Array.isArray(value)) return `Array(${value.length})`
  if (typeof value === "object") return "Object"
  return String(value)
}

/* -----------------------------------------------------------------------------
 * Nodes
 * -----------------------------------------------------------------------------*/

function dataType<T = unknown>(opts: JsonDataTypeOptions<T>) {
  return opts
}

/** A node without children */
const leaf =
  <T>(type: JsonNodeType): JsonNodeCreatorFn<T> =>
  ({ value, keyPath }) => ({ value, type, keyPath })

type Read<T> = (value: T, key: string) => unknown

/** A node whose children are the given properties */
const fromKeys =
  <T>(type: JsonNodeType, keys: string[], read: Read<T> = getProp as Read<T>): JsonNodeCreatorFn<T> =>
  ({ value, keyPath, createNode }) => ({
    value,
    keyPath,
    type,
    children: keys.map((key) => createNode([key], read(value, key))),
  })

/** The non-enumerable `[[Entries]]` node a collection shows its items under */
const entriesNode = (keyPath: JsonNodeKeyPath, value: unknown[], children: JsonNode[]): JsonNode => ({
  keyPath: [...keyPath, ENTRIES_KEY],
  value,
  type: "array",
  children,
  isNonEnumerable: true,
})

/** `[[Entries]]` of key-value pairs, each shown as an object with `key` and `value` */
function pairEntries(
  { keyPath, createNode }: Pick<JsonNodeCreatorParams, "keyPath" | "createNode">,
  entries: Array<[unknown, unknown]>,
  // form data can repeat a name, so its entries are keyed by position
  byIndex = false,
) {
  const children = entries.map(([key, value], index): JsonNode => {
    const name = String(key)
    const segment = byIndex ? index : name
    return {
      keyPath: [...keyPath, ENTRIES_KEY, index],
      value: { [name]: value },
      type: "object",
      children: [createNode([ENTRIES_KEY, segment, "key"], key), createNode([ENTRIES_KEY, segment, "value"], value)],
    }
  })
  return entriesNode(keyPath, entries, children)
}

/** Non-enumerable properties, marked as such and carrying their descriptor */
function hiddenProps(
  value: object,
  keys: string[],
  createNode: JsonNodeCreatorParams["createNode"],
  label: (key: string) => string,
) {
  return keys.map((key) => {
    const node = createNode([label(key)], getProp(value, key))
    node.isNonEnumerable = true
    node.propertyDescriptor = Object.getOwnPropertyDescriptor(value, key)
    return node
  })
}

const internalLabel = (key: string) => `[[${key}]]`

/* -----------------------------------------------------------------------------
 * Primitives
 * -----------------------------------------------------------------------------*/

export const NullType = dataType<null>({
  type: "null",
  description: "null",
  check: (value) => value === null,
  previewElement: () => part("null"),
  node: leaf("null"),
})

export const UndefinedType = dataType<undefined>({
  type: "undefined",
  description: "undefined",
  check: (value) => value === undefined,
  previewElement: () => part("undefined"),
  node: leaf("undefined"),
})

export const SymbolType = dataType<symbol>({
  type: "symbol",
  description: (node) => String(node.value),
  check: (value) => typeof value === "symbol",
  previewElement: (node) => part(node.value.toString()),
  node: leaf("symbol"),
})

export const BigIntType = dataType<bigint>({
  type: "bigint",
  description: (node) => `${node.value}n`,
  check: (value) => typeof value === "bigint",
  previewElement: (node) => part(`${node.value}n`),
  node: leaf("bigint"),
})

const STRING_ESCAPES: Record<string, string> = { "\n": "\\n", "\t": "\\t", "\r": "\\r" }
const STRING_ESCAPE_REGEXP = /[\n\t\r]/g

const escapeString = (value: string) => value.replace(STRING_ESCAPE_REGEXP, (char) => STRING_ESCAPES[char])

export const StringType = dataType<string>({
  type: "string",
  description(node, opts) {
    return `"${this.previewText?.(node, opts) ?? node.value}"`
  },
  check: (value) => typeof value === "string",
  previewText(node, opts) {
    const serialised = escapeString(node.value)
    const limit = opts.collapseStringsAfterLength
    return serialised.slice(0, limit) + (serialised.length > limit ? "…" : "")
  },
  previewElement: (node) => part(`"${escapeString(node.value)}"`),
  node: leaf("string"),
})

export const PrimitiveType = dataType<any>({
  type: (value) => typeof value as JsonNodeType,
  description: (node) => String(node.value),
  check: (value) => value !== null && value !== undefined,
  previewElement: (node) => part(String(node.value)),
  node: ({ value, keyPath }) => ({ value, type: typeof value as JsonNodeType, keyPath }),
})

/* -----------------------------------------------------------------------------
 * Collections
 * -----------------------------------------------------------------------------*/

export const SetType = dataType<Set<unknown>>({
  type: "set",
  description: (node) => `Set(${node.value.size})`,
  check: (value) => value instanceof Set,
  previewText(node, opts) {
    const { size } = node.value
    const items = take(node.value, Math.min(Math.max(opts.maxPreviewItems, 0), size))
    return previewList(items.map(formatValue), size > opts.maxPreviewItems)
  },
  previewElement(node, opts) {
    return braced(`Set(${node.value.size})`, " {", this.previewText?.(node, opts) ?? "", "}")
  },
  node({ value, keyPath, createNode }) {
    const entries = Array.from(value)
    const children = entries.map((item, index) => createNode([ENTRIES_KEY, index.toString()], item))
    return {
      type: "set",
      value,
      keyPath,
      children: [entriesNode(keyPath, entries, children), createNode(["size"], value.size)],
    }
  },
})

export const MapType = dataType<Map<unknown, unknown>>({
  type: "map",
  description: (node) => `Map(${node.value.size})`,
  check: (value) => value instanceof Map,
  previewText(node, opts) {
    const { size } = node.value
    const entries = take(node.value.entries(), Math.min(Math.max(opts.maxPreviewItems, 0), size))
    const items = entries.map(([key, value]) => {
      return `${formatValue(key)} => ${formatValue(value)}`
    })
    return previewList(items, size > opts.maxPreviewItems)
  },
  previewElement(node, opts) {
    return braced(`Map(${node.value.size})`, " {", this.previewText?.(node, opts) || "", "}")
  },
  node(params) {
    const { value, keyPath, createNode } = params
    return {
      value,
      keyPath,
      type: "map",
      children: [pairEntries(params, Array.from(value.entries())), createNode(["size"], value.size)],
    }
  },
})

export const WeakSetType = dataType<WeakSet<WeakKey>>({
  type: "weakset",
  description: "WeakSet",
  check: (value) => value instanceof WeakSet,
  previewElement: () => shell("WeakSet", " {", NOT_ENUMERABLE, "}"),
  node: leaf("weakset"),
})

export const WeakMapType = dataType<WeakMap<WeakKey, WeakKey>>({
  type: "weakmap",
  description: "WeakMap",
  check: (value) => value instanceof WeakMap,
  previewElement: () => shell("WeakMap", " {", NOT_ENUMERABLE, "}"),
  node: leaf("weakmap"),
})

export const ArrayType = dataType<Array<unknown>>({
  type: "array",
  description: (node) => `Array(${node.value.length})`,
  check: (value) => Array.isArray(value),
  previewText(node, opts) {
    const maxItems = opts.maxPreviewItems
    const items = (node.children || []).filter(
      (child) => !child.isNonEnumerable && keyPathToKey(child.keyPath) !== "length",
    )
    return previewList(items.slice(0, maxItems).map(formatValueMini), items.length > maxItems)
  },
  previewElement(node, opts) {
    const count = node.value.length
    return braced(count > 0 ? `(${count}) ` : undefined, "[", this.previewText?.(node, opts) || "", "]")
  },
  node({ value, keyPath, createNode, options }) {
    // sparse arrays only show the slots that hold a value
    const indices = getIndices(value)
    const children: JsonNode[] = []

    const chunkSize = options?.groupArraysAfterLength
    if (chunkSize && indices.length > chunkSize) {
      for (let start = 0; start < indices.length; start += chunkSize) {
        const chunk = indices.slice(start, start + chunkSize)
        children.push({
          keyPath: [...keyPath, `[${chunk[0]}…${chunk[chunk.length - 1]}]`],
          value: chunk.map((index) => value[index]),
          type: "array",
          children: chunk.map((index) => createNode([index.toString()], value[index])),
          isNonEnumerable: false,
        })
      }
    } else {
      for (const index of indices) children.push(createNode([index.toString()], value[index]))
    }

    // the true length, holes included
    children.push(createNode(["length"], value.length))

    if (options?.showNonenumerable) {
      const named = Object.getOwnPropertyNames(value).filter((key) => key !== "length" && !isIndexKey(key))
      children.push(...hiddenProps(value, named, createNode, String))
    }

    return { value, type: "array", children, keyPath }
  },
})

function getIndices(array: unknown[]) {
  const indices: number[] = []
  for (let index = 0; index < array.length; index++) {
    if (index in array) indices.push(index)
  }
  return indices
}

// cheap first: names that don't start with a digit can't be indices
function isIndexKey(key: string) {
  const code = key.charCodeAt(0)
  if (code < 48 || code > 57) return false
  return !Number.isNaN(Number(key))
}

const TYPED_ARRAY_TYPES: Record<string, JsonNodeType> = {
  Int8Array: "int8array",
  Uint8Array: "uint8array",
  Uint8ClampedArray: "uint8clampedarray",
  Int16Array: "int16array",
  Uint16Array: "uint16array",
  Int32Array: "int32array",
  Uint32Array: "uint32array",
  Float32Array: "float32array",
  Float64Array: "float64array",
  BigInt64Array: "bigint64array",
  BigUint64Array: "biguint64array",
}

const TYPED_ARRAY_KEYS = ["length", "byteLength", "byteOffset", "buffer"]

export const TypedArrayType = dataType<any>({
  type: (value) => TYPED_ARRAY_TYPES[value.constructor?.name],
  description: (node) => `${node.value.constructor.name}(${node.value.length})`,
  check: (value) => isObj(value) && value.constructor?.name in TYPED_ARRAY_TYPES,
  previewElement(node) {
    const array = node.value
    const preview = Array.from(array.subarray(0, 5)).join(", ") + more(array.length > 5)
    return shell(`${array.constructor.name}(${array.length})`, " [ ", preview, " ]", "preview-text")
  },
  node(params) {
    const { value, createNode, options } = params
    const node = fromKeys<any>(TYPED_ARRAY_TYPES[value.constructor.name], TYPED_ARRAY_KEYS)(params)
    if (options?.showNonenumerable) {
      // only the first values, since a typed array can be huge
      const values = createNode(["[[Values]]"], Array.from(value.subarray(0, 100)))
      values.isNonEnumerable = true
      node.children!.push(values)
    }
    return node
  },
})

export const IterableType = dataType<any>({
  type: "iterable",
  description: "Iterable",
  check: (value) =>
    Boolean(
      value &&
      typeof value === "object" &&
      typeof value[Symbol.iterator] === "function" &&
      !(value instanceof Set) &&
      !(value instanceof Map) &&
      !Array.isArray(value) &&
      !(value instanceof Date) &&
      !(value instanceof RegExp) &&
      !(value instanceof ArrayBuffer),
    ),
  previewElement(node, opts) {
    const items = Array.from(node.value as Iterable<unknown>)
    const preview = previewList(
      items.slice(0, opts.maxPreviewItems).map(formatValue),
      items.length > opts.maxPreviewItems,
    )
    const size = node.value.size ?? node.value.length ?? items.length
    return braced(`Iterable(${size})`, " {", preview, "}")
  },
  node({ value, keyPath, createNode }) {
    const items = Array.from(value as Iterable<unknown>)
    const children = items.map((item, index) => createNode([ENTRIES_KEY, index], item))
    const size = value.size ?? value.length ?? items.length
    return {
      value,
      type: "iterable",
      children: [entriesNode(keyPath, items, children), createNode(["size"], size)],
      keyPath,
    }
  },
})

/* -----------------------------------------------------------------------------
 * Objects
 * -----------------------------------------------------------------------------*/

export const ObjectType = dataType<object>({
  type: "object",
  description: "Object",
  check: (value) => typeof value === "object" && value !== null,
  previewText(node, opts) {
    const maxItems = opts.maxPreviewItems
    const children = node.children || []
    const items = children
      .slice(0, maxItems)
      .map((child) => `${keyPathToKey(child.keyPath)}: ${getNodeTypeDescription(child)}`)
    return previewList(items, children.length > maxItems)
  },
  previewElement(node, opts) {
    const constructor = node.constructorName ? `${node.constructorName} ` : undefined
    return braced(constructor, "{", this.previewText?.(node, opts) ?? "", "}")
  },
  node: ({ value, keyPath, createNode, options }) => {
    const keys = Object.keys(value)
    const children = keys.map((key) => createNode([key], getProp(value, key)))
    if (options?.showNonenumerable) {
      children.push(...hiddenProps(value, getNonEnumerableKeys(value, keys), createNode, internalLabel))
    }
    return { value, type: "object", children, keyPath }
  },
})

export const ClassType = dataType<any>({
  type: "object",
  description: (node) => node.constructorName || "Object",
  // objects made with `Object.create(null)` have no constructor and show as plain objects
  check: (value) =>
    typeof value === "object" &&
    value !== null &&
    typeof value.constructor === "function" &&
    value.constructor !== Object,
  previewText: (node, opts) => ObjectType.previewText?.(node, opts) || "",
  previewElement: (node, opts) => ObjectType.previewElement(node, opts),
  node: (params) => ({ ...ObjectType.node(params), constructorName: params.value.constructor.name }),
})

const FUNCTION_SIGNATURE_REGEX = /(?:async\s+)?(?:function\s*\*?\s*)?([^(]*\([^)]*\))/
const FUNCTION_KEYS = ["name", "length", "prototype", "caller", "arguments"]

const isAsync = (name: string) => name === "AsyncFunction" || name === "AsyncGeneratorFunction"
const isGenerator = (name: string) => name === "GeneratorFunction" || name === "AsyncGeneratorFunction"

// `toString` throws for some proxies and host functions
function getFunctionString(func: Function): string {
  try {
    return func.toString()
  } catch {
    const name = func.constructor.name
    return `${isAsync(name) ? "async " : ""}function ${isGenerator(name) ? "* " : ""}() {}`
  }
}

const CLASS_REGEX = /^class[\s{]/

const isClass = (func: Function) => CLASS_REGEX.test(getFunctionString(func))

function getFunctionSignature(func: Function): string {
  const match = getFunctionString(func).match(FUNCTION_SIGNATURE_REGEX)
  return match ? match[1] : `${func.name || "anonymous"}()`
}

export const FunctionType = dataType<Function>({
  type: "function",
  description(node) {
    const name = node.value.constructor.name
    if (isClass(node.value)) return `class ${node.value.name || "anonymous"}`
    return `${isAsync(name) ? "async " : ""}ƒ${isGenerator(name) ? "*" : ""} ${node.value.name || "anonymous"}()`
  },
  check: (value) => typeof value === "function",
  previewElement(node) {
    // a class's source is its whole body, so only its name shows
    if (isClass(node.value)) {
      return span({}, [part("class ", "function-type"), part(node.value.name || "anonymous", "function-body")])
    }
    const name = node.value.constructor.name
    const signature = getFunctionSignature(node.value)
    const preview = signature.length > 50 ? `${signature.substring(0, 47)}...` : signature
    const prefix = `${isAsync(name) ? "async " : ""}${isGenerator(name) ? "ƒ* " : "ƒ "}`
    return span({}, [part(prefix, "function-type"), part(preview, "function-body")])
  },
  node({ value, keyPath, createNode, options }) {
    const extra = Object.getOwnPropertyNames(value).filter((key) => !FUNCTION_KEYS.includes(key))
    const children = [
      createNode(["name"], value.name || "anonymous"),
      createNode(["length"], value.length),
      createNode(["constructor"], value.constructor.name),
      ...extra.map((key) => createNode([key], getProp(value, key))),
    ]
    if (options?.showNonenumerable) {
      const implementation = createNode(["[[Function]]"], getFunctionString(value))
      implementation.isNonEnumerable = true
      children.push(implementation)
    }
    return { value, type: "function", keyPath, children }
  },
})

const ERROR_KEYS = ["name", "message", "stack"]

export const ErrorType = dataType<Error>({
  type: "error",
  description: (node) => `${node.value.name}: ${node.value.message}`,
  check: (value) => value instanceof Error,
  previewElement: (node) =>
    span({}, [part(node.value.name, "constructor"), part(": ", "colon"), part(node.value.message)]),
  node(params) {
    const extra = Object.getOwnPropertyNames(params.value).filter((key) => !ERROR_KEYS.includes(key))
    return fromKeys<Error>("error", [...ERROR_KEYS, ...extra])(params)
  },
})

function errorStackToElement(stack: string): JsonNodeElement {
  const lines = stack.split("\n").filter((line) => line.trim())
  return span(
    {},
    lines.map((line, index) => {
      const last = index === lines.length - 1
      return span({ nodeType: "string", kind: "error-stack" }, [
        part(line + (last ? "" : "\\n")),
        part(last ? "" : " +", "operator"),
      ])
    }),
  )
}

const REACT_ELEMENT_KEYS = ["$$typeof", "type", "key", "ref", "props"]

function getElementTypeName(type: any): string {
  if (typeof type === "string") return type
  if (typeof type === "function") return type.displayName || type.name || "Component"
  return type?.toString() || "Component"
}

export const ReactElementType = dataType<any>({
  type: "react-element",
  description: (node) => getElementTypeName(node.value.type),
  check: (value) => isObj(value) && "$$typeof" in value && "props" in value,
  previewElement(node, opts) {
    const el = node.value
    const name = getElementTypeName(el.type)
    const props = Object.entries(el.props)
    const shown = props
      .slice(0, opts.maxPreviewItems)
      .filter(([key]) => key !== "children")
      .map(([key, value]) => part(` ${key}=${typeof value === "string" ? `"${value}"` : `{${value}}`}`))
    return span({}, [
      txt(`<${name}`),
      ...shown,
      ...(props.length > opts.maxPreviewItems ? [txt(" …")] : []),
      txt(el.props?.children != null ? `>{…}</${name}>` : " />"),
    ])
  },
  node: fromKeys<any>("react-element", REACT_ELEMENT_KEYS, (value, key) =>
    key === "type" ? getElementTypeName(value.type) : getProp(value, key),
  ),
})

/* -----------------------------------------------------------------------------
 * Built-in objects
 * -----------------------------------------------------------------------------*/

export const DateType = dataType<Date>({
  type: "date",
  description: (node) => String(node.value),
  check: (value) => value instanceof Date,
  previewElement: (node) => part(node.value.toISOString()),
  node: leaf("date"),
})

const REGEX_KEYS = [
  "lastIndex",
  "dotAll",
  "flags",
  "global",
  "hasIndices",
  "ignoreCase",
  "multiline",
  "source",
  "sticky",
  "unicode",
]

export const RegexType = dataType<RegExp>({
  type: "regex",
  description: (node) => String(node.value),
  check: (value) => value instanceof RegExp,
  previewElement: (node) => part(String(node.value)),
  node: fromKeys("regex", REGEX_KEYS),
})

export const ArrayBufferType = dataType<ArrayBuffer>({
  type: "arraybuffer",
  description: (node) => `ArrayBuffer(${node.value.byteLength})`,
  check: (value) => value instanceof ArrayBuffer,
  previewElement: (node) => part(`ArrayBuffer(${node.value.byteLength})`),
  node: leaf("arraybuffer"),
})

export const SharedArrayBufferType = dataType<SharedArrayBuffer>({
  type: "sharedarraybuffer",
  description: (node) => `SharedArrayBuffer(${node.value.byteLength})`,
  check: (value) => typeof SharedArrayBuffer !== "undefined" && value instanceof SharedArrayBuffer,
  previewElement: (node) => part(`SharedArrayBuffer(${node.value.byteLength})`),
  node: leaf("sharedarraybuffer"),
})

export const BufferType = dataType<Buffer>({
  type: "buffer",
  description: (node) => `Buffer(${node.value.length})`,
  check: (value) => typeof Buffer !== "undefined" && value instanceof Buffer,
  previewElement(node) {
    const buffer = node.value
    const bytes = Array.from(new Uint8Array(buffer).slice(0, 8))
    const preview = bytes.map((byte) => byte.toString(16).padStart(2, "0")).join(" ")
    return shell(`Buffer(${buffer.length})`, " ['", preview + (buffer.length > 8 ? " …" : ""), "']", "preview-text")
  },
  node: leaf("buffer"),
})

export const DataViewType = dataType<DataView>({
  type: "dataview",
  description: (node) => `DataView(${node.value.byteLength})`,
  check: (value) => value instanceof DataView,
  previewElement(node) {
    const view = node.value
    const preview = ` buffer: ArrayBuffer(${view.buffer.byteLength}), byteOffset: ${view.byteOffset} `
    return shell(`DataView(${view.byteLength})`, " {", preview, "}")
  },
  node: fromKeys("dataview", ["byteLength", "byteOffset", "buffer"]),
})

const URL_KEYS = [
  "href",
  "origin",
  "protocol",
  "username",
  "password",
  "host",
  "hostname",
  "port",
  "pathname",
  "search",
  "searchParams",
  "hash",
]

export const UrlType = dataType<URL>({
  type: "url",
  description: "URL",
  check: (value) => typeOf(value) === "[object URL]",
  previewElement(node, opts) {
    const maxItems = opts.maxPreviewItems
    const preview = URL_KEYS.slice(0, maxItems)
      .map((key) => `${key}: '${Reflect.get(node.value, key)}'`)
      .join(", ")
    return shell("URL", " {", ` ${preview}${more(URL_KEYS.length > maxItems)} `, "}", "preview-text")
  },
  node: fromKeys("url", URL_KEYS),
})

export const URLSearchParamsType = dataType<URLSearchParams>({
  type: "urlsearchparams",
  description: "URLSearchParams",
  check: (value) => typeOf(value) === "[object URLSearchParams]",
  previewElement: (node) => shell("URLSearchParams", " { ", `size: ${Array.from(node.value.entries()).length}`, " }"),
  node(params) {
    const { value, keyPath, createNode } = params
    const entries = Array.from(value.entries())
    return {
      value,
      keyPath,
      type: "urlsearchparams",
      children: [pairEntries(params, entries), createNode(["size"], entries.length)],
    }
  },
})

/** `key: value` pairs from the first two entries, for headers and form data */
function previewPairs(entries: Array<[string, unknown]>, format: (value: unknown) => string = String) {
  if (entries.length === 0) return ""
  const preview = entries
    .slice(0, 2)
    .map(([key, value]) => `${key}: ${format(value)}`)
    .join(", ")
  return ` ${preview}${more(entries.length > 2)} `
}

export const HeadersType = dataType<Headers>({
  type: "headers",
  description: "Headers",
  check: (value) => typeOf(value) === "[object Headers]",
  previewElement(node) {
    const entries = Array.from(node.value.entries())
    return shell(`Headers(${entries.length})`, " {", previewPairs(entries), "}", "preview-text")
  },
  node: (params) => ({
    value: params.value,
    keyPath: params.keyPath,
    type: "headers",
    children: [pairEntries(params, Array.from(params.value.entries()))],
  }),
})

export const BlobType = dataType<Blob>({
  type: "blob",
  description: (node) => `Blob(${node.value.size})`,
  check: (value) => typeOf(value) === "[object Blob]",
  previewElement(node) {
    const blob = node.value
    return shell("Blob", " { ", `size: ${blob.size}, type: '${blob.type || "application/octet-stream"}'`, " }")
  },
  node: fromKeys("blob", ["size", "type"]),
})

const FILE_KEYS = ["name", "size", "type", "lastModified", "webkitRelativePath"]

export const FileType = dataType<File>({
  type: "file",
  description: (node) => `File(${node.value.size})`,
  check: (value) => typeOf(value) === "[object File]",
  previewElement(node) {
    const file = node.value
    const preview = `name: '${file.name}', lastModified: ${file.lastModified}${more(FILE_KEYS.length > 2)}`
    return shell("File", " { ", preview, " }")
  },
  node: fromKeys<File>("file", FILE_KEYS, (value, key) => getProp(value, key) || ""),
})

export const FormDataType = dataType<FormData>({
  type: "formdata",
  description: "FormData",
  check: (value) => typeOf(value) === "[object FormData]",
  previewElement(node) {
    const entries = Array.from(node.value.entries())
    const format = (value: unknown) => (FileType.check(value) ? `File(${(value as File).size})` : String(value))
    return shell(`FormData(${entries.length})`, " {", previewPairs(entries, format), "}", "preview-text")
  },
  node: (params) => ({
    value: params.value,
    keyPath: params.keyPath,
    type: "formdata",
    children: [pairEntries(params, Array.from(params.value.entries()), true)],
  }),
})

/* -----------------------------------------------------------------------------
 * DOM
 * -----------------------------------------------------------------------------*/

const ELEMENT_KEYS = [
  "attributes",
  "childElementCount",
  "className",
  "dataset",
  "hidden",
  "id",
  "inert",
  "isConnected",
  "isContentEditable",
  "nodeType",
  "style",
  "tabIndex",
  "tagName",
]

const isSvg = (el: Element): el is SVGSVGElement =>
  typeof el === "object" && el.tagName === "svg" && el.namespaceURI === "http://www.w3.org/2000/svg"

const isHTML = (el: Element): el is HTMLElement =>
  typeof el === "object" && el.namespaceURI === "http://www.w3.org/1999/xhtml"

// attributes and inline styles read as plain objects, or nothing when empty
function readElementKey(el: HTMLElement | SVGElement, key: string) {
  if (key === "attributes") {
    const attrs = Array.from(el.attributes)
    return attrs.length ? Object.fromEntries(attrs.map((attr) => [attr.name, attr.value])) : undefined
  }
  if (key === "style") {
    const names = Array.from(el.style)
    return names.length ? Object.fromEntries(names.map((name) => [name, el.style.getPropertyValue(name)])) : undefined
  }
  return getProp(el, key)
}

export const ElementType = dataType<SVGElement | HTMLElement>({
  type: "element",
  description: (node) => typeOf(node.value),
  check: (value) => isSvg(value) || isHTML(value),
  previewElement(node) {
    const el = node.value as Element
    const classes = Array.from(el.classList).slice(0, 3)
    const selector = `<${el.localName}${el.id ? `#${el.id}` : ""}${classes.length > 0 ? "." + classes.join(".") : ""}>`
    return span({}, [part(el.constructor.name, "constructor"), part(" "), part(selector, "preview-text")])
  },
  node: fromKeys("element", ELEMENT_KEYS, readElementKey),
})

export const DocumentType = dataType<Document>({
  type: "document",
  description: "Document",
  // the tag differs between HTML and XML documents, and between environments
  check: (value) => isObj(value) && value.nodeType === 9 && "documentElement" in value,
  previewElement: (node) =>
    span({}, [part("#document", "constructor"), part(` (${node.value.URL || "unknown"})`, "preview-text")]),
  node: fromKeys("document", ["title", "URL", "documentElement", "head", "body", "contentType", "readyState"]),
})

export const WindowType = dataType<Window>({
  type: "window",
  description: "Window",
  check: (value) => isObj(value) && value.window === value,
  previewElement: () => span({}, [part("Window", "constructor"), part(" { … }", "preview-text")]),
  node: fromKeys("window", [
    "location",
    "navigator",
    "document",
    "innerWidth",
    "innerHeight",
    "devicePixelRatio",
    "origin",
  ]),
})

/* -----------------------------------------------------------------------------
 * Registry
 * -----------------------------------------------------------------------------*/

/** Checked in order; the first match describes a value. Add a type to the front to override a built-in. */
export const dataTypes: JsonDataTypeOptions<any>[] = [
  NullType,
  UndefinedType,
  SymbolType,
  BigIntType,
  FunctionType,

  ArrayBufferType,
  SharedArrayBufferType,
  BufferType,

  DataViewType,
  ErrorType,
  DateType,
  RegexType,

  SetType,
  MapType,

  WeakMapType,
  WeakSetType,

  FileType,
  BlobType,

  ReactElementType,
  WindowType,
  DocumentType,
  ElementType,

  UrlType,
  URLSearchParamsType,
  HeadersType,
  FormDataType,
  ArrayType,
  TypedArrayType,
  IterableType,

  ClassType,
  ObjectType,

  StringType,
  PrimitiveType,
]

const defaultDataTypes = dataTypes.slice()
const defaultChecks = dataTypes.map((dataType) => dataType.check)

const isDefaultRegistry = () =>
  dataTypes.length === defaultDataTypes.length &&
  dataTypes.every((dataType, index) => dataType === defaultDataTypes[index] && dataType.check === defaultChecks[index])

/** @internal */
export function getDataType(value: unknown): JsonDataTypeOptions | undefined {
  // no built-in checked before these can match them, so skip the checks while the registry holds only the built-ins
  const known =
    typeof value === "string"
      ? StringType
      : typeof value === "number" || typeof value === "boolean"
        ? PrimitiveType
        : Array.isArray(value)
          ? ArrayType
          : undefined

  if (known && isDefaultRegistry()) return known

  return dataTypes.find((dataType) => dataType.check(value))
}

export const jsonNodeToElement = (node: JsonNode, opts?: Partial<JsonNodePreviewOptions>): JsonNodeHastElement => {
  const options = getPreviewOptions(opts)
  const key = keyPathToKey(node.keyPath, { excludeRoot: true })

  if (key === "stack" && typeof node.value === "string") {
    return errorStackToElement(node.value)
  }

  // a circular node holds a placeholder string, which shouldn't read as a quoted value
  if (node.type === "circular") {
    return span({ kind: "preview", nodeType: "circular", ...(key ? {} : { root: true }) }, [txt(CIRCULAR)])
  }

  const dataType = getDataType(node.value)
  if (!dataType) return part(String(node.value))

  const element = dataType.previewElement(node, options)
  if (!key) element.properties.root = true

  element.properties.kind = "preview"
  element.properties.nodeType = typeof dataType.type === "function" ? dataType.type(node.value) : dataType.type

  return element
}

export const getNodeTypeDescription = (node: JsonNode, opts?: Partial<JsonNodePreviewOptions>): string => {
  if (node.type === "circular") return CIRCULAR
  const dataType = getDataType(node.value)
  if (!dataType) return String(node.value)
  // called as a method, since a description can read the type's own preview through `this`
  return typeof dataType.description === "function"
    ? dataType.description(node, getPreviewOptions(opts))
    : dataType.description
}
