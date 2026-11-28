import { describe, expect, test } from "vitest"
import * as jsonTree from "../../src/json-tree"
import {
  dataTypes,
  getAccessibleDescription,
  getDataType,
  getNodeTypeDescription,
  jsonNodeToElement,
  jsonToTree,
} from "../../src/json-tree"
import { elementText } from "./test-utils"

// a sample value for every built-in type except the DOM ones, which need a document
const samples: Record<string, unknown> = {
  NullType: null,
  UndefinedType: undefined,
  SymbolType: Symbol("s"),
  BigIntType: 1n,
  FunctionType: function f() {},
  ArrayBufferType: new ArrayBuffer(2),
  SharedArrayBufferType: new SharedArrayBuffer(2),
  BufferType: Buffer.from("hi"),
  DataViewType: new DataView(new ArrayBuffer(2)),
  ErrorType: new Error("e"),
  DateType: new Date(0),
  RegexType: /r/,
  SetType: new Set(),
  MapType: new Map(),
  WeakMapType: new WeakMap(),
  WeakSetType: new WeakSet(),
  FileType: new File(["x"], "f.txt", { lastModified: 1 }),
  BlobType: new Blob(["x"]),
  ReactElementType: { $$typeof: Symbol.for("react.element"), type: "b", key: null, ref: null, props: {} },
  UrlType: new URL("https://zag.dev"),
  URLSearchParamsType: new URLSearchParams("a=1"),
  HeadersType: new Headers(),
  FormDataType: new FormData(),
  ArrayType: [],
  TypedArrayType: new Uint8Array(1),
  IterableType: { *[Symbol.iterator]() {} },
  ClassType: new (class Thing {})(),
  ObjectType: {},
  StringType: "s",
  PrimitiveType: 1,
}

const DOM_TYPES = ["WindowType", "DocumentType", "ElementType"]

const show = (value: unknown) => {
  const node = jsonToTree(value)
  return `${node.type} | ${elementText(jsonNodeToElement(node))} | ${getNodeTypeDescription(node)} | ${getAccessibleDescription(node)}`
}

describe("data types", () => {
  test("every built-in type has a sample, and the registry resolves the sample to it", () => {
    const names = Object.keys(jsonTree).filter(
      (name) => name.endsWith("Type") && dataTypes.includes((jsonTree as any)[name]),
    )
    expect(names.filter((name) => !(name in samples) && !DOM_TYPES.includes(name))).toEqual([])
    for (const [name, value] of Object.entries(samples)) {
      expect(getDataType(value), name).toBe((jsonTree as any)[name])
    }
  })

  test("type, preview, description and label for each sample", () => {
    const rows = Object.entries(samples)
      .filter(([name]) => name !== "DateType")
      .map(([name, value]) => `${name.padEnd(22)} ${show(value)}`)
    expect(rows.join("\n")).toMatchInlineSnapshot(`
      "NullType               null | null | null | null
      UndefinedType          undefined | undefined | undefined | undefined
      SymbolType             symbol | Symbol(s) | Symbol(s) | Symbol(s)
      BigIntType             bigint | 1n | 1n | 1n
      FunctionType           function | ƒ f() | ƒ f() | ƒ f(), expandable with 4 properties
      ArrayBufferType        arraybuffer | ArrayBuffer(2) | ArrayBuffer(2) | ArrayBuffer(2)
      SharedArrayBufferType  sharedarraybuffer | SharedArrayBuffer(2) | SharedArrayBuffer(2) | SharedArrayBuffer(2)
      BufferType             buffer | Buffer(2) ['68 69'] | Buffer(2) | Buffer(2)
      DataViewType           dataview | DataView(2) { buffer: ArrayBuffer(2), byteOffset: 0 } | DataView(2) | DataView(2), expandable with 3 properties
      ErrorType              error | Error: e | Error: e | Error: e, expandable with 3 properties
      RegexType              regex | /r/ | /r/ | /r/, expandable with 10 properties
      SetType                set | Set(0) {} | Set(0) | Set(0), expandable with 2 properties
      MapType                map | Map(0) {} | Map(0) | Map(0), expandable with 2 properties
      WeakMapType            weakmap | WeakMap { [[Entries]]: not enumerable } | WeakMap | WeakMap
      WeakSetType            weakset | WeakSet { [[Entries]]: not enumerable } | WeakSet | WeakSet
      FileType               file | File { name: 'f.txt', lastModified: 1, … } | File(1) | File(1), expandable with 5 properties
      BlobType               blob | Blob { size: 1, type: 'application/octet-stream' } | Blob(1) | Blob(1), expandable with 2 properties
      ReactElementType       react-element | <b /> | b | b, expandable with 5 properties
      UrlType                url | URL { href: 'https://zag.dev/', origin: 'https://zag.dev', protocol: 'https:', … } | URL | URL, expandable with 12 properties
      URLSearchParamsType    urlsearchparams | URLSearchParams { size: 1 } | URLSearchParams | URLSearchParams, expandable with 2 properties
      HeadersType            headers | Headers(0) {} | Headers | Headers, expandable with 1 property
      FormDataType           formdata | FormData(0) {} | FormData | FormData, expandable with 1 property
      ArrayType              array | [] | Array(0) | Array(0), expandable with 1 property
      TypedArrayType         uint8array | Uint8Array(1) [ 0 ] | Uint8Array(1) | Uint8Array(1), expandable with 5 properties
      IterableType           iterable | Iterable(0) {} | Iterable | Iterable, expandable with 2 properties
      ClassType              object | Thing {} | Thing | Thing
      ObjectType             object | {} | Object | Object
      StringType             string | "s" | "s" | "s"
      PrimitiveType          number | 1 | 1 | 1"
    `)
  })

  test("every typed array", () => {
    const arrays = [
      new Int8Array([-1]),
      new Uint8Array([1]),
      new Uint8ClampedArray([300]),
      new Int16Array([-1]),
      new Uint16Array([1]),
      new Int32Array([-1]),
      new Uint32Array([1]),
      new Float32Array([0.5]),
      new Float64Array([0.25]),
      new BigInt64Array([-1n]),
      new BigUint64Array([1n]),
    ]
    expect(arrays.map(show).join("\n")).toMatchInlineSnapshot(`
      "int8array | Int8Array(1) [ -1 ] | Int8Array(1) | Int8Array(1), expandable with 5 properties
      uint8array | Uint8Array(1) [ 1 ] | Uint8Array(1) | Uint8Array(1), expandable with 5 properties
      uint8clampedarray | Uint8ClampedArray(1) [ 255 ] | Uint8ClampedArray(1) | Uint8ClampedArray(1), expandable with 5 properties
      int16array | Int16Array(1) [ -1 ] | Int16Array(1) | Int16Array(1), expandable with 5 properties
      uint16array | Uint16Array(1) [ 1 ] | Uint16Array(1) | Uint16Array(1), expandable with 5 properties
      int32array | Int32Array(1) [ -1 ] | Int32Array(1) | Int32Array(1), expandable with 5 properties
      uint32array | Uint32Array(1) [ 1 ] | Uint32Array(1) | Uint32Array(1), expandable with 5 properties
      float32array | Float32Array(1) [ 0.5 ] | Float32Array(1) | Float32Array(1), expandable with 5 properties
      float64array | Float64Array(1) [ 0.25 ] | Float64Array(1) | Float64Array(1), expandable with 5 properties
      bigint64array | BigInt64Array(1) [ -1 ] | BigInt64Array(1) | BigInt64Array(1), expandable with 5 properties
      biguint64array | BigUint64Array(1) [ 1 ] | BigUint64Array(1) | BigUint64Array(1), expandable with 5 properties"
    `)
  })

  test("classes show their name, not their source", () => {
    class Store {
      items = []
    }
    expect(show(Store)).toMatchInlineSnapshot(
      `"function | class Store | class Store | class Store, expandable with 4 properties"`,
    )
  })

  test("react elements with and without children", () => {
    const element = (props: Record<string, unknown>) => ({
      $$typeof: Symbol.for("react.element"),
      type: "p",
      key: null,
      ref: null,
      props,
    })
    expect([show(element({ id: "a" })), show(element({ id: "a", children: "text" })), show(element({}))].join("\n"))
      .toMatchInlineSnapshot(`
        "react-element | <p id="a" /> | p | p, expandable with 5 properties
        react-element | <p id="a">{…}</p> | p | p, expandable with 5 properties
        react-element | <p /> | p | p, expandable with 5 properties"
      `)
  })

  test("functions by kind", () => {
    async function a() {}
    async function* b() {}
    function* c() {}
    const d = () => {}
    expect([a, b, c, d, function () {}.bind(null)].map(show).join("\n")).toMatchInlineSnapshot(`
      "function | async ƒ a() | async ƒ a() | async ƒ a(), expandable with 4 properties
      function | async ƒ* b() | async ƒ* b() | async ƒ* b(), expandable with 4 properties
      function | ƒ* c() | ƒ* c() | ƒ* c(), expandable with 4 properties
      function | ƒ () | ƒ d() | ƒ d(), expandable with 4 properties
      function | ƒ () | ƒ bound () | ƒ bound (), expandable with 4 properties"
    `)
  })
})
