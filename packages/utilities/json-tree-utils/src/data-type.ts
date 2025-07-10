import type { JsonDataTypeOptions, JsonNode, JsonNodeElement, JsonNodeType, JsonNodePreviewOptions } from "./types"

///////////////////////////////////////////////////////////////////////////////////////////

const join = (...parts: string[]) => parts.filter(Boolean).join("/")

const generatePreviewText = (items: string[], hasMore: boolean): string => {
  return ` ${items.join(", ")}${hasMore ? ", … " : " "}`
}

const hasProp = (value: object, key: string): boolean => {
  return Object.prototype.hasOwnProperty.call(value, key)
}

const getProp = (value: object, key: string): unknown => {
  return value[key as keyof typeof value]
}

const formatValueMini = (child: JsonNode): string => {
  if (child.type === "primitive" && typeof child.value === "string") return `"${child.value}"`
  if (child.type === "null") return "null"
  if (child.type === "undefined" || child.type === "symbol") return "undefined"
  if (child.type === "object") return "{…}"
  if (child.type === "array") return "[…]"
  if (child.type === "set") return "Set(…)"
  if (child.type === "map") return "Map(…)"
  if (child.type === "iterable") return "Iterable(…)"
  if (child.type === "function") return "ƒ(…)"
  return String(child.value)
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

///////////////////////////////////////////////////////////////////////////////////////////

function dataType<T = unknown>(opts: JsonDataTypeOptions<T>) {
  return opts
}

///////////////////////////////////////////////////////////////////////////////////////////

export const NullType = dataType<null>({
  type: "null",
  description(node) {
    return `Array(${node.children?.length || 0})`
  },
  check(value) {
    return value === null
  },
  previewElement() {
    return {
      type: "span",
      props: { kind: "preview", nodeType: "null", children: "null" },
    }
  },
  node({ id, parentKey }) {
    return {
      id,
      key: parentKey,
      value: null,
      type: "null",
      keyPath: [parentKey],
      dataTypePath: "null",
    }
  },
})

///////////////////////////////////////////////////////////////////////////////////////////

export const UndefinedType = dataType<undefined>({
  type: "undefined",
  description: "undefined",
  check(value) {
    return value === undefined
  },
  previewElement() {
    return {
      type: "span",
      props: { children: "undefined" },
    }
  },
  node({ id, parentKey, keyPath, dataTypePath }) {
    return {
      id,
      key: parentKey,
      value: undefined,
      type: "undefined",
      keyPath,
      dataTypePath,
    }
  },
})

///////////////////////////////////////////////////////////////////////////////////////////

export const SymbolType = dataType<symbol>({
  type: "symbol",
  description(node) {
    return String(node.value)
  },
  check(value) {
    return typeof value === "symbol"
  },
  previewElement(node) {
    return {
      type: "span",
      props: { children: node.value.toString() },
    }
  },
  node({ id, parentKey, value }) {
    return {
      id,
      key: parentKey,
      value,
      type: "symbol",
    }
  },
})

///////////////////////////////////////////////////////////////////////////////////////////

export const BigIntType = dataType<BigInt>({
  type: "bigint",
  description(node) {
    return `${node.value}n`
  },
  check(value) {
    return typeof value === "bigint"
  },
  previewElement(node) {
    return {
      type: "span",
      props: { children: `${node.value}n` },
    }
  },
  node({ id, parentKey, value }) {
    return {
      id,
      key: parentKey,
      value,
      type: "bigint",
    }
  },
})

///////////////////////////////////////////////////////////////////////////////////////////

export const SetType = dataType<Set<unknown>>({
  type: "set",
  description(node) {
    return `Set(${node.children?.length || 0})`
  },
  check(value) {
    return value instanceof Set
  },
  previewText(node, opts) {
    const maxItems = opts.maxPreviewItems
    const entries = Array.from(node.value as Set<unknown>)
    const values = entries.slice(0, maxItems).map(formatValue)
    const hasMore = entries.length > maxItems
    return generatePreviewText(values, hasMore)
  },
  previewElement(node, opts) {
    const preview = this.previewText?.(node, opts) ?? ""
    const size = node.children?.length || 0

    const children: JsonNodeElement[] = [
      { type: "span", props: { kind: "constructor", children: `Set(${size})` } },
      { type: "span", props: { kind: "brace", children: " {" } },
    ]
    if (preview) {
      children.push({ type: "span", props: { kind: "preview-text", children: preview } })
    }
    children.push({ type: "span", props: { kind: "brace", children: "}" } })

    return {
      type: "span",
      props: { children },
    }
  },
  node({ value, id, parentKey, createNode, visited }) {
    const entriesChildren = Array.from(value).map((item, index) =>
      createNode(item, index.toString(), `${id}.[[Entries]]`, visited),
    )

    const entriesNode: JsonNode = {
      id: `${id}.[[Entries]]`,
      key: "[[Entries]]",
      value: Array.from(value),
      type: "array",
      children: entriesChildren,
      isNonEnumerable: true,
    }

    const sizeNode = createNode(value.size, "size", id, visited)

    return {
      id,
      key: parentKey,
      value,
      type: "set",
      children: [entriesNode, sizeNode],
    }
  },
})

///////////////////////////////////////////////////////////////////////////////////////////

export const WeakSetType = dataType<WeakSet<WeakKey>>({
  type: "weakset",
  description: "WeakSet",
  check(value) {
    return value instanceof WeakSet
  },
  previewElement() {
    return {
      type: "span",
      props: {
        children: [
          { type: "span", props: { kind: "constructor", children: "WeakSet" } },
          { type: "span", props: { kind: "brace", children: " {" } },
          { type: "span", props: { kind: "preview", children: " [[Entries]]: not enumerable " } },
          { type: "span", props: { kind: "brace", children: "}" } },
        ],
      },
    }
  },
  node({ value, id, parentKey }) {
    return {
      id,
      key: parentKey,
      value,
      type: "weakset",
    }
  },
})

///////////////////////////////////////////////////////////////////////////////////////////

export const WeakMapType = dataType<WeakMap<WeakKey, WeakKey>>({
  type: "weakmap",
  description: "WeakMap",
  check(value) {
    return value instanceof WeakMap
  },
  previewElement() {
    return {
      type: "span",
      props: {
        children: [
          { type: "span", props: { kind: "constructor", children: "WeakMap" } },
          { type: "span", props: { kind: "brace", children: " {" } },
          { type: "span", props: { kind: "preview", children: " [[Entries]]: not enumerable " } },
          { type: "span", props: { kind: "brace", children: "}" } },
        ],
      },
    }
  },
  node({ value, id, parentKey }) {
    return {
      id,
      key: parentKey,
      value,
      type: "weakmap",
    }
  },
})

///////////////////////////////////////////////////////////////////////////////////////////

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
  description(node) {
    return String(node.value)
  },
  check(value) {
    return value instanceof RegExp
  },
  previewElement(node) {
    return { type: "span", props: { children: String(node.value) } }
  },
  node({ value, id, createNode, parentKey }) {
    const children = REGEX_KEYS.map((key) => createNode(getProp(value, key), key))
    return {
      id,
      key: parentKey,
      value,
      type: "regex",
      children,
    }
  },
})

///////////////////////////////////////////////////////////////////////////////////////////

const DATA_VIEW_KEYS = ["byteLength", "byteOffset", "buffer"]

export const DataViewType = dataType<DataView>({
  type: "dataview",
  description(node) {
    return `DataView(${node.value.byteLength})`
  },
  check(value) {
    return value instanceof DataView
  },
  previewElement(node) {
    const dataView = node.value
    return {
      type: "span",
      props: {
        children: [
          { type: "span", props: { kind: "constructor", children: `DataView(${dataView.byteLength})` } },
          { type: "span", props: { kind: "brace", children: " { " } },
          {
            type: "span",
            props: {
              kind: "preview",
              children: ` buffer: ArrayBuffer(${dataView.buffer.byteLength}), byteOffset: ${dataView.byteOffset} `,
            },
          },
          { type: "span", props: { kind: "brace", children: " }" } },
        ],
      },
    }
  },
  node({ value, id, createNode, parentKey }) {
    const children = DATA_VIEW_KEYS.map((key) => createNode(getProp(value, key), key))
    return {
      id,
      key: parentKey,
      value,
      type: "dataview",
      children,
    }
  },
})

///////////////////////////////////////////////////////////////////////////////////////////

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
  check(value: object) {
    return URL_KEYS.every((key) => hasProp(value, key))
  },
  previewElement(node) {
    const url = node.value
    const maxItems = 5
    const hasMore = URL_KEYS.length > maxItems
    return {
      type: "span",
      props: {
        children: [
          { type: "span", props: { kind: "constructor", children: "URL" } },
          { type: "span", props: { kind: "brace", children: " { " } },
          {
            type: "span",
            props: {
              kind: "preview",
              children: `origin: '${url.origin}', protocol: '${url.protocol}', username: '${url.username}', password: '${url.password}', host: '${url.host}'${hasMore ? ", …" : ""}`,
            },
          },
          { type: "span", props: { kind: "brace", children: " }" } },
        ],
      },
    }
  },
  node({ value, id, createNode, parentKey }) {
    const children = URL_KEYS.map((key) => createNode(Reflect.get(value, key), key))
    return {
      id,
      key: parentKey,
      value,
      type: "url",
      children,
    }
  },
})

///////////////////////////////////////////////////////////////////////////////////////////

export const URLSearchParamsType = dataType<URLSearchParams>({
  type: "urlsearchparams",
  description: "URLSearchParams",
  check(value) {
    return value instanceof URLSearchParams
  },
  previewElement(node) {
    const params = node.value
    const paramsArray = Array.from(params.entries())
    return {
      type: "span",
      props: {
        children: [
          { type: "span", props: { kind: "constructor", children: "URLSearchParams" } },
          { type: "span", props: { kind: "brace", children: " { " } },
          { type: "span", props: { kind: "preview", children: `size: ${paramsArray.length}` } },
          { type: "span", props: { kind: "brace", children: " }" } },
        ],
      },
    }
  },
  node({ value, id, createNode, parentKey, visited }) {
    const entriesChildren = Array.from(value.entries()).map(([key, value], index): JsonNode => {
      const entryId = join(id, "[[Entries]]", index.toString())

      const keyNode = createNode(key, "key", entryId, visited)
      const valueNode = createNode(value, "value", entryId, visited)

      return {
        id: entryId,
        key: index.toString(),
        value: { [key]: value },
        type: "object",
        children: [keyNode, valueNode],
      }
    })

    const entriesNode: JsonNode = {
      id: join(id, "[[Entries]]"),
      key: "[[Entries]]",
      value: Array.from(value.entries()),
      type: "array",
      children: entriesChildren,
      isNonEnumerable: true,
    }

    return {
      id,
      key: parentKey,
      value,
      type: "urlsearchparams",
      children: [entriesNode],
    }
  },
})

///////////////////////////////////////////////////////////////////////////////////////////

const BLOB_KEYS = ["size", "type"]

export const BlobType = dataType<Blob>({
  type: "blob",
  description(node) {
    return `Blob(${node.value.size})`
  },
  check(value) {
    return value instanceof Blob
  },
  previewElement(node) {
    const blob = node.value
    return {
      type: "span",
      props: {
        children: [
          { type: "span", props: { kind: "constructor", children: "Blob" } },
          { type: "span", props: { kind: "brace", children: " { " } },
          {
            type: "span",
            props: {
              kind: "preview",
              children: `size: ${blob.size}, type: '${blob.type || "application/octet-stream"}'`,
            },
          },
          { type: "span", props: { kind: "brace", children: " }" } },
        ],
      },
    }
  },
  node({ value, id, createNode, parentKey, visited }) {
    const blobProperties = BLOB_KEYS.map((key) => ({ key, value: Reflect.get(value, key) }))
    const children = blobProperties.map(({ key, value }) => createNode(value, key, id, visited))
    return {
      id,
      key: parentKey,
      value,
      type: "blob",
      children,
    }
  },
})

///////////////////////////////////////////////////////////////////////////////////////////

const FILE_KEYS = ["name", "size", "type", "lastModified", "webkitRelativePath"]

export const FileType = dataType<File>({
  type: "file",
  description: "File",
  check(value) {
    return typeof File !== "undefined" && value instanceof File
  },
  previewElement(node) {
    const file = node.value
    const maxItems = 2
    const hasMore = FILE_KEYS.length > maxItems
    return {
      type: "span",
      props: {
        children: [
          { type: "span", props: { kind: "constructor", children: "File" } },
          { type: "span", props: { kind: "brace", children: " { " } },
          {
            type: "span",
            props: {
              kind: "preview",
              children: `name: '${file.name}', lastModified: ${file.lastModified}${hasMore ? ", …" : ""}`,
            },
          },
          { type: "span", props: { kind: "brace", children: " }" } },
        ],
      },
    }
  },
  node({ value, id, createNode, parentKey, visited }) {
    const fileProperties = FILE_KEYS.map((key) => ({ key, value: getProp(value, key) || "" }))
    const children = fileProperties.map(({ key, value }) => createNode(value, key, id, visited))
    return {
      id,
      key: parentKey,
      value,
      type: "file",
      children,
    }
  },
})

///////////////////////////////////////////////////////////////////////////////////////////

const getFunctionString = (func: Function): string => {
  try {
    return func.toString()
  } catch {
    switch (func.constructor.name) {
      case "AsyncFunction":
        return "async function () {}"
      case "AsyncGeneratorFunction":
        return "async function * () {}"
      case "GeneratorFunction":
        return "function * () {}"
      default:
        return "function () {}"
    }
  }
}

const FUNCTION_SIGNATURE_REGEX = /(?:async\s+)?(?:function\s*\*?\s*)?([^(]*\([^)]*\))/

const getFunctionSignature = (func: Function): string => {
  const funcString = getFunctionString(func)
  const signatureMatch = funcString.match(FUNCTION_SIGNATURE_REGEX)
  return signatureMatch ? signatureMatch[1] : `${func.name || "anonymous"}()`
}

export const FunctionType = dataType<Function>({
  type: "function",
  description(node) {
    const func = node.value
    const name = func.name || "anonymous"
    const constructorName = func.constructor.name

    switch (constructorName) {
      case "AsyncFunction":
        return `async ƒ ${name}()`
      case "AsyncGeneratorFunction":
        return `async ƒ* ${name}()`
      case "GeneratorFunction":
        return `ƒ* ${name}()`
      default:
        return `ƒ ${name}()`
    }
  },
  check(value) {
    return typeof value === "function"
  },
  previewElement(node) {
    const func = node.value
    const signature = getFunctionSignature(func)
    const constructorName = func.constructor.name

    // Show a shortened version if too long
    const preview = signature.length > 50 ? `${signature.substring(0, 47)}...` : signature

    let functionTypePrefix = ""
    if (constructorName === "AsyncFunction") functionTypePrefix += "async "
    if (constructorName === "AsyncGeneratorFunction") functionTypePrefix += "async "
    if (constructorName === "GeneratorFunction" || constructorName === "AsyncGeneratorFunction")
      functionTypePrefix += "ƒ* "
    if (!constructorName.includes("Generator")) functionTypePrefix += "ƒ "

    return {
      type: "span",
      props: {
        children: [
          { type: "span", props: { kind: "function-type", children: functionTypePrefix } },
          { type: "span", props: { kind: "function-body", children: preview } },
        ],
      },
    }
  },
  node({ value, id, parentKey, createNode, visited }) {
    const funcName = value.name || "anonymous"
    const constructorName = value.constructor.name

    // Extract function properties
    const funcProperties = []

    // Add the [[Function]] internal property showing the function implementation
    const funcString = getFunctionString(value)
    funcProperties.push({ key: "[[Function]]", value: funcString })

    // Add function metadata
    funcProperties.push({ key: "name", value: funcName })
    funcProperties.push({ key: "length", value: value.length })
    funcProperties.push({ key: "constructor", value: constructorName })

    // Add any additional enumerable properties
    const additionalProps = Object.getOwnPropertyNames(value)
      .filter((key) => !["name", "length", "prototype", "caller", "arguments"].includes(key))
      .map((key) => ({ key, value: Reflect.get(value, key) }))

    const allProperties = [...funcProperties, ...additionalProps]
    const children = allProperties.map(({ key, value }) => {
      const node = createNode(value, key, id, visited)
      if (key === "[[Function]]") node.isNonEnumerable = true
      return node
    })

    return {
      id,
      key: parentKey,
      value,
      type: "function",
      children,
    }
  },
})

///////////////////////////////////////////////////////////////////////////////////////////

export const ArrayBufferType = dataType<ArrayBuffer>({
  type: "arraybuffer",
  description(node) {
    return `ArrayBuffer(${node.value.byteLength})`
  },
  check(value) {
    return value instanceof ArrayBuffer
  },
  previewElement(node) {
    return { type: "span", props: { nodeType: "arraybuffer", children: node.value.toString() } }
  },
  node({ value, id, parentKey }) {
    return {
      id,
      key: parentKey,
      value: `ArrayBuffer(${value.byteLength})`,
      type: "arraybuffer",
    }
  },
})

///////////////////////////////////////////////////////////////////////////////////////////

export const SharedArrayBufferType = dataType<SharedArrayBuffer>({
  type: "sharedarraybuffer",
  description(node) {
    return `SharedArrayBuffer(${node.value.byteLength})`
  },
  check(value) {
    return typeof SharedArrayBuffer !== "undefined" && value instanceof SharedArrayBuffer
  },
  previewElement() {
    return { type: "span", props: { nodeType: "sharedarraybuffer", children: "sharedarraybuffer" } }
  },
  node({ value, id, parentKey }) {
    return {
      id,
      key: parentKey,
      value: `SharedArrayBuffer(${value.byteLength})`,
      type: "sharedarraybuffer",
    }
  },
})

///////////////////////////////////////////////////////////////////////////////////////////

export const BufferType = dataType<Buffer>({
  type: "buffer",
  description(node) {
    return `Buffer(${node.value.length})`
  },
  check(value) {
    return typeof Buffer !== "undefined" && value instanceof Buffer
  },
  previewElement(node) {
    const buffer = node.value
    const preview = Array.from(new Uint8Array(buffer).slice(0, 8))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join(" ")
    const hasMore = buffer.length > 8
    return {
      type: "span",
      props: {
        children: [
          { type: "span", props: { kind: "constructor", children: `Buffer(${buffer.length})` } },
          { type: "span", props: { kind: "brace", children: " ['" } },
          { type: "span", props: { kind: "preview-text", children: preview + (hasMore ? " …" : "") } },
          { type: "span", props: { kind: "brace", children: "']" } },
        ],
      },
    }
  },
  node({ value, id, parentKey }) {
    return {
      id,
      key: parentKey,
      value,
      type: "buffer",
    }
  },
})

///////////////////////////////////////////////////////////////////////////////////////////

export const DateType = dataType<Date>({
  type: "date",
  description(node) {
    return String(node.value)
  },
  check(value) {
    return value instanceof Date
  },
  previewElement(node) {
    return {
      type: "span",
      props: { children: node.value.toISOString() },
    }
  },
  node({ value, id, parentKey }) {
    return {
      id,
      key: parentKey,
      value,
      type: "date",
    }
  },
})

///////////////////////////////////////////////////////////////////////////////////////////

export const MapType = dataType<Map<unknown, unknown>>({
  type: "map",
  description(node) {
    return `Map(${node.children?.length || 0})`
  },
  check(value) {
    return value instanceof Map
  },
  previewText(node, opts) {
    const maxItems = opts.maxPreviewItems
    const entries = Array.from((node.value as Map<unknown, unknown>).entries())
    const previews = entries.slice(0, maxItems).map(([key, value]) => {
      const valueDesc = formatValue(value)
      const keyStr = typeof key === "string" ? `"${key}"` : String(key)
      return `${keyStr} => ${valueDesc}`
    })
    const hasMore = entries.length > maxItems
    return generatePreviewText(previews, hasMore)
  },
  previewElement(node, opts) {
    const preview = this.previewText?.(node, opts) || ""
    const size = node.children?.length || 0

    const children: JsonNodeElement[] = [
      { type: "span", props: { kind: "constructor", children: `Map(${size})` } },
      { type: "span", props: { kind: "brace", children: " {" } },
    ]
    if (preview) {
      children.push({ type: "span", props: { kind: "preview-text", children: preview } })
    }
    children.push({ type: "span", props: { kind: "brace", children: "}" } })

    return {
      type: "span",
      props: { children },
    }
  },
  node({ value, id, parentKey, createNode, visited, keyPath, dataTypePath }) {
    const entriesChildren = Array.from(value.entries()).map(([key, value], index): JsonNode => {
      const entryId = join(id, "[[Entries]]", index.toString())
      const entryKeyPath = [...keyPath, "[[Entries]]", index.toString()]
      const entryDataTypePath = join(dataTypePath, "[[Entries]]", index.toString())
      const keyNode = createNode(key, "key", entryId, visited, entryKeyPath, entryDataTypePath)
      const valueNode = createNode(value, "value", entryId, visited, entryKeyPath, entryDataTypePath)

      return {
        id: entryId,
        key: index.toString(),
        value: { [String(key)]: value },
        type: "object",
        children: [keyNode, valueNode],
      }
    })

    const entriesNode: JsonNode = {
      id: join(id, "[[Entries]]"),
      key: "[[Entries]]",
      value: Array.from(value.entries()),
      type: "array",
      children: entriesChildren,
      isNonEnumerable: true,
    }

    const sizeNode = createNode(value.size, "size", id, visited, keyPath, dataTypePath)

    return {
      id,
      key: parentKey,
      value,
      type: "map",
      children: [entriesNode, sizeNode],
    }
  },
})

///////////////////////////////////////////////////////////////////////////////////////////

const ERROR_KEYS = ["name", "message", "stack"]

export const ErrorType = dataType<Error>({
  type: "error",
  description(node) {
    const err = node.value
    return `${err.name}: ${err.message}`
  },
  check(value) {
    return value instanceof Error
  },
  previewElement(node) {
    const err = node.value
    return {
      type: "span",
      props: {
        children: [
          { type: "span", props: { kind: "constructor", children: err.name } },
          { type: "span", props: { kind: "colon", children: ": " } },
          { type: "span", props: { children: err.message } },
        ],
      },
    }
  },
  node({ value, id, parentKey, createNode, visited }) {
    const errorProperties = ERROR_KEYS.map((key) => ({ key, value: Reflect.get(value, key) }))

    const additionalProps = Object.getOwnPropertyNames(value)
      .filter((key) => !ERROR_KEYS.includes(key))
      .map((key) => ({ key, value: getProp(value, key) }))

    const allProperties = [...errorProperties, ...additionalProps]
    const children = allProperties.map(({ key, value }) => createNode(value, key, id, visited))

    return {
      id,
      key: parentKey,
      value,
      type: "error",
      children,
    }
  },
})

function errorStackToElement(stack: string): JsonNodeElement {
  const stackLines = stack?.split("\n").filter((line) => line.trim()) || []
  return {
    type: "span",
    props: {
      children: stackLines.map((line, index) => {
        const appendNewLine = index < stackLines.length - 1
        return {
          type: "span",
          props: {
            nodeType: "string",
            kind: "error-stack",
            children: [
              { type: "span", props: { children: line + (appendNewLine ? "\\n" : "") } },
              { type: "span", props: { kind: "operator", children: appendNewLine ? " +" : "" } },
            ],
          },
        }
      }),
    },
  }
}

///////////////////////////////////////////////////////////////////////////////////////////

export const HeadersType = dataType<Headers>({
  type: "headers",
  description: "Headers",
  check(value) {
    return typeof Headers !== "undefined" && value instanceof Headers
  },
  previewElement(node) {
    const headers = node.value
    const entriesArray = Array.from(headers.entries())
    const preview = entriesArray
      .slice(0, 2)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ")
    const hasMore = entriesArray.length > 2
    return {
      type: "span",
      props: {
        children: [
          { type: "span", props: { kind: "constructor", children: `Headers(${entriesArray.length})` } },
          { type: "span", props: { kind: "brace", children: " {" } },
          { type: "span", props: { kind: "preview-text", children: ` ${preview}${hasMore ? ", …" : ""} ` } },
          { type: "span", props: { kind: "brace", children: "}" } },
        ],
      },
    }
  },
  node({ value, id, parentKey, createNode, visited }) {
    const entriesChildren = Array.from(value.entries()).map(([key, value], index): JsonNode => {
      const entryId = join(id, "[[Entries]]", index.toString())
      const keyNode = createNode(key, "key", entryId, visited)
      const valueNode = createNode(value, "value", entryId, visited)

      return {
        id: entryId,
        key: index.toString(),
        value: { [key]: value },
        type: "object",
        children: [keyNode, valueNode],
      }
    })

    const entriesNode: JsonNode = {
      id: join(id, "[[Entries]]"),
      key: "[[Entries]]",
      value: Array.from(value.entries()),
      type: "array",
      children: entriesChildren,
      isNonEnumerable: true,
    }

    return {
      id,
      key: parentKey,
      value,
      type: "headers",
      children: [entriesNode],
    }
  },
})

///////////////////////////////////////////////////////////////////////////////////////////

export const FormDataType = dataType<FormData>({
  type: "formdata",
  description: "FormData",
  check(value) {
    return typeof FormData !== "undefined" && value instanceof FormData
  },
  previewElement(node) {
    const formData = node.value
    const entriesArray = Array.from(formData.entries())

    const preview = entriesArray
      .slice(0, 2)
      .map(([key, value]) => {
        const valueStr = value instanceof File ? `File(${value.name})` : String(value)
        return `${key}: ${valueStr}`
      })
      .join(", ")

    const hasMore = entriesArray.length > 2

    return {
      type: "span",
      props: {
        children: [
          { type: "span", props: { kind: "constructor", children: `FormData(${entriesArray.length})` } },
          { type: "span", props: { kind: "brace", children: " {" } },
          { type: "span", props: { kind: "preview-text", children: ` ${preview}${hasMore ? ", …" : ""} ` } },
          { type: "span", props: { kind: "brace", children: "}" } },
        ],
      },
    }
  },
  node({ value, id, parentKey, createNode, visited }) {
    const entriesChildren = Array.from(value.entries()).map(([key, value], index): JsonNode => {
      const entryId = join(id, "[[Entries]]", index.toString())
      const keyNode = createNode(key, "key", entryId, visited)
      const valueNode = createNode(value, "value", entryId, visited)

      return {
        id: entryId,
        key: index.toString(),
        value: { [key]: value },
        type: "object",
        children: [keyNode, valueNode],
      }
    })

    const entriesNode: JsonNode = {
      id: join(id, "[[Entries]]"),
      key: "[[Entries]]",
      value: Array.from(value.entries()),
      type: "array",
      children: entriesChildren,
      isNonEnumerable: true,
    }

    return {
      id,
      key: parentKey,
      value,
      type: "formdata",
      children: [entriesNode],
    }
  },
})

///////////////////////////////////////////////////////////////////////////////////////////

export const ArrayType = dataType<Array<unknown>>({
  type: "array",
  description(node) {
    return `Array(${node.children?.length || 0})`
  },
  check(value) {
    return Array.isArray(value)
  },
  previewText(node, opts) {
    const maxItems = opts.maxPreviewItems
    const children = node.children || []
    const enumerableChildren = children.filter((child) => !child.isNonEnumerable && child.key !== "length")
    const values = enumerableChildren.slice(0, maxItems).map(formatValueMini)
    const hasMore = enumerableChildren.length > maxItems
    return generatePreviewText(values, hasMore)
  },
  previewElement(node, opts) {
    const preview = this.previewText?.(node, opts) || ""
    const count = node.value.length

    const children: JsonNodeElement[] = []
    if (count > 0) {
      children.push({ type: "span", props: { kind: "constructor", children: `(${count}) ` } })
    }
    children.push({ type: "span", props: { kind: "brace", children: "[" } })
    if (preview) {
      children.push({ type: "span", props: { kind: "preview-text", children: preview } })
    }
    children.push({ type: "span", props: { kind: "brace", children: "]" } })

    return {
      type: "span",
      props: { children },
    }
  },
  node({ value, id, parentKey, createNode, visited, keyPath, dataTypePath }) {
    // Handle sparse arrays by showing only slots with actual values
    // This prevents crashes when arrays have holes (e.g., let arr = []; arr[50] = "value")
    const arrayChildren: JsonNode[] = []

    // Use Object.keys to get only the indices that actually have values
    // This automatically handles sparse arrays by skipping undefined slots
    const definedIndices = Object.keys(value)
      .filter((key) => !Number.isNaN(Number(key))) // Only numeric indices
      .map(Number)
      .sort((a, b) => a - b) // Sort numerically

    // Create nodes only for indices that have values
    for (const index of definedIndices) {
      arrayChildren.push(createNode(value[index], index.toString(), id, visited))
    }

    // Add length property to show the true size of the array (including sparse slots)
    const lengthChild = createNode(value.length, "length", id, visited)

    // Get non-enumerable properties
    const allPropertyNames = Object.getOwnPropertyNames(value)
    const enumerableKeys = Object.keys(value).filter((key) => !Number.isNaN(Number(key))) // Only numeric indices
    const nonEnumerableKeys = allPropertyNames.filter(
      (key) =>
        !enumerableKeys.includes(key) &&
        key !== "length" && // length is already handled above
        Number.isNaN(Number(key)), // exclude numeric indices
    )

    const nonEnumerableChildren = nonEnumerableKeys.map((key) => {
      const descriptor = Object.getOwnPropertyDescriptor(value, key)
      const node = createNode(Reflect.get(value, key), key, id, visited)
      node.isNonEnumerable = true
      node.propertyDescriptor = descriptor
      return node
    })

    const children = [...arrayChildren, lengthChild, ...nonEnumerableChildren]

    return {
      id,
      key: parentKey,
      value,
      type: "array",
      children,
      keyPath,
      dataTypePath,
    }
  },
})

///////////////////////////////////////////////////////////////////////////////////////////

const typedArrayConstructors = {
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

const revertTypedArrayConstructors = Object.fromEntries(
  Object.entries(typedArrayConstructors).map(([key, value]) => [value, key]),
)

const TYPED_ARRAY_KEYS = ["length", "byteLength", "byteOffset", "buffer"]

export const TypedArrayType = dataType<any>({
  type: (value) => Reflect.get(typedArrayConstructors, value.constructor.name),
  description(node) {
    const typedArray = node.value
    const constructorName = typedArray.constructor.name
    return `${revertTypedArrayConstructors[constructorName]}(${typedArray.length})`
  },
  check(value) {
    return Boolean(value && typeof value === "object" && value.constructor.name in typedArrayConstructors)
  },
  previewElement(node) {
    const typedArray = node.value
    const constructorName = typedArray.constructor.name
    const preview = Array.from(typedArray).slice(0, 5).join(", ")
    const hasMore = typedArray.length > 5
    return {
      type: "span",
      props: {
        children: [
          {
            type: "span",
            props: { kind: "constructor", children: `${constructorName}(${typedArray.length})` },
          },
          { type: "span", props: { kind: "brace", children: " [ " } },
          { type: "span", props: { kind: "preview-text", children: preview + (hasMore ? ", …" : "") } },
          { type: "span", props: { kind: "brace", children: " ]" } },
        ],
      },
    }
  },
  node({ value, id, parentKey, createNode, visited }) {
    const typedArray = value as any
    const properties = TYPED_ARRAY_KEYS.map((key) => ({ key, value: Reflect.get(typedArray, key) }))

    // Show first few values
    const values = Array.from(typedArray).slice(0, 100) // Limit for performance
    properties.push({ key: "[[Values]]", value: values })

    const children = properties.map(({ key, value }) => {
      const node = createNode(value, key, id, visited)
      if (key === "[[Values]]") node.isNonEnumerable = true
      return node
    })

    return {
      id,
      key: parentKey,
      value,
      type: Reflect.get(typedArrayConstructors, value.constructor.name),
      children,
    }
  },
})

///////////////////////////////////////////////////////////////////////////////////////////

export const IterableType = dataType<any>({
  type: "iterable",
  description: "Iterable",
  check(value) {
    return Boolean(
      value &&
        typeof value === "object" &&
        typeof (value as any)[Symbol.iterator] === "function" &&
        !(value instanceof Set) &&
        !(value instanceof Map) &&
        !Array.isArray(value) &&
        !(value instanceof Date) &&
        !(value instanceof RegExp) &&
        !(value instanceof ArrayBuffer),
    )
  },
  previewElement(node, opts) {
    const preview = SetType.previewText?.(node, opts) ?? ""
    const size = node.children?.length || 0

    const children: JsonNodeElement[] = [
      { type: "span", props: { kind: "constructor", children: `Iterable(${size})` } },
      { type: "span", props: { kind: "brace", children: " {" } },
    ]
    if (preview) {
      children.push({ type: "span", props: { kind: "preview-text", children: preview } })
    }
    children.push({ type: "span", props: { kind: "brace", children: "}" } })

    return {
      type: "span",
      props: { children },
    }
  },
  node({ value, id, parentKey, createNode, visited }) {
    const entriesArray = Array.from(value as Iterable<unknown>)
    const entriesChildren = entriesArray.map((item, index) =>
      createNode(item, index.toString(), join(id, "[[Entries]]"), visited),
    )
    const entriesNode: JsonNode = {
      id: join(id, "[[Entries]]"),
      key: "[[Entries]]",
      value: entriesArray,
      type: "array",
      children: entriesChildren,
      isNonEnumerable: true,
    }

    // Try to get size/length property
    const sizeValue = value.size ?? value.length ?? entriesArray.length
    const sizeNode = createNode(sizeValue, "size", id, visited)

    return {
      id,
      key: parentKey,
      value,
      type: "iterable",
      children: [entriesNode, sizeNode],
    }
  },
})

///////////////////////////////////////////////////////////////////////////////////////////

export const ClassType = dataType<any>({
  type: "object",
  description(node) {
    return node.constructorName || "Object"
  },
  check(value) {
    return typeof value === "object" && value !== null && value.constructor !== Object
  },
  previewText(node, opts) {
    return ObjectType.previewText?.(node, opts) || ""
  },
  previewElement(node, opts) {
    return ObjectType.previewElement(node, opts)
  },
  node({ value, id, parentKey, createNode, visited, keyPath, dataTypePath }) {
    const constructorName = value.constructor.name
    const allPropertyNames = Object.getOwnPropertyNames(value)
    const enumerableKeys = Object.keys(value)
    const nonEnumerableKeys = allPropertyNames.filter((key) => !enumerableKeys.includes(key))

    const children = [
      ...enumerableKeys.map((key) => createNode(Reflect.get(value, key), key, id, visited)),
      ...nonEnumerableKeys.map((key) => {
        const descriptor = Object.getOwnPropertyDescriptor(value, key)
        const node = createNode(getProp(value, key), `[[${key}]]`, id, visited)
        node.isNonEnumerable = true
        node.propertyDescriptor = descriptor
        return node
      }),
    ]

    return {
      id,
      key: parentKey,
      value,
      type: "object",
      constructorName,
      children,
      keyPath,
      dataTypePath,
    }
  },
})

///////////////////////////////////////////////////////////////////////////////////////////

export const ObjectType = dataType<object>({
  type: "object",
  description: "Object",
  check(value) {
    return typeof value === "object" && value !== null
  },
  previewText(node, opts) {
    const maxItems = opts.maxPreviewItems
    const children = node.children || []
    const previews = children.slice(0, maxItems).map((child) => {
      const valueDesc = getNodeTypeDescription(child)
      return `${child.key}: ${valueDesc}`
    })
    const hasMore = children.length > maxItems
    return generatePreviewText(previews, hasMore)
  },
  previewElement(node, opts) {
    const preview = this.previewText?.(node, opts) ?? ""
    const children: JsonNodeElement[] = []

    if (node.constructorName) {
      children.push({ type: "span", props: { kind: "constructor", children: `${node.constructorName} ` } })
    }
    children.push({ type: "span", props: { kind: "brace", children: "{" } })
    if (preview) {
      children.push({ type: "span", props: { kind: "preview-text", children: preview } })
    }
    children.push({ type: "span", props: { kind: "brace", children: "}" } })

    return {
      type: "span",
      props: { children },
    }
  },
  node({ value, id, parentKey, createNode, visited, keyPath, dataTypePath }) {
    const allPropertyNames = Object.getOwnPropertyNames(value)

    const enumerableKeys = Object.keys(value)
    const nonEnumerableKeys = allPropertyNames.filter((key) => !enumerableKeys.includes(key))

    const children = [
      ...enumerableKeys.map((key) => createNode(getProp(value, key), key, id, visited, keyPath, dataTypePath)),
      ...nonEnumerableKeys.map((key) => {
        const descriptor = Object.getOwnPropertyDescriptor(value, key)
        const node = createNode(getProp(value, key), `[[${key}]]`, id, visited, keyPath, dataTypePath)
        node.isNonEnumerable = true
        node.propertyDescriptor = descriptor
        return node
      }),
    ]

    return {
      id,
      key: parentKey,
      value,
      type: "object",
      children,
      keyPath,
      dataTypePath,
    }
  },
})

///////////////////////////////////////////////////////////////////////////////////////////

const map: Record<string, string> = {
  "\n": "\\n",
  "\t": "\\t",
  "\r": "\\r",
}

const STRING_ESCAPE_REGEXP = /[\n\t\r]/g

export const StringType = dataType<string>({
  type: "primitive",
  description(node, opts) {
    return `"${this.previewText?.(node, opts) ?? node.value}"`
  },
  check(value) {
    return typeof value === "string"
  },
  previewText(node, opts) {
    const serialised = node.value.replace(STRING_ESCAPE_REGEXP, (_: string) => map[_])
    const preview =
      serialised.slice(0, opts.collapseStringsAfterLength) +
      (serialised.length > opts.collapseStringsAfterLength ? "…" : "")
    return preview
  },
  previewElement(node) {
    const serialised = node.value.replace(STRING_ESCAPE_REGEXP, (_: string) => map[_])
    return {
      type: "span",
      props: { children: `"${serialised}"` },
    }
  },
  node({ value, id, parentKey }) {
    return {
      id,
      key: parentKey,
      value,
      type: "primitive",
    }
  },
})

///////////////////////////////////////////////////////////////////////////////////////////

export const PrimitiveType = dataType<any>({
  type(value) {
    return typeof value as JsonNodeType
  },
  description(node) {
    return String(node.value)
  },
  check(value) {
    return value !== null && value !== undefined
  },
  previewElement(node) {
    return {
      type: "span",
      props: {
        children: String(node.value),
      },
    }
  },
  node({ value, id, parentKey, keyPath, dataTypePath }) {
    return {
      id,
      key: parentKey,
      value,
      type: "primitive",
      keyPath,
      dataTypePath,
    }
  },
})

///////////////////////////////////////////////////////////////////////////////////////////

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

///////////////////////////////////////////////////////////////////////////////////////////

export const defaultPreviewOptions: JsonNodePreviewOptions = {
  maxPreviewItems: 3,
  collapseStringsAfterLength: 30,
}

export const jsonNodeToElement = (node: JsonNode, opts = defaultPreviewOptions): JsonNodeElement => {
  if (node.key === "stack" && typeof node.value === "string") {
    return errorStackToElement(node.value)
  }

  const dataType = dataTypes.find((dataType) => dataType.check(node.value))
  if (!dataType) {
    return { type: "span", props: { children: String(node.value) } }
  }

  const element = dataType.previewElement(node, opts)

  if (!node.key) {
    element.props.root = true
  }

  element.props.kind = "preview"
  element.props.nodeType = typeof dataType.type === "function" ? dataType.type(node.value) : dataType.type

  return element
}

///////////////////////////////////////////////////////////////////////////////////////////

export const getNodeTypeDescription = (node: JsonNode, opts = defaultPreviewOptions): string => {
  const dataType = dataTypes.find((dataType) => dataType.check(node.value))
  if (dataType) {
    return typeof dataType.description === "function" ? dataType.description(node, opts) : dataType.description
  }
  return String(node.value)
}
