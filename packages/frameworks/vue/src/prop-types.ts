import type * as Vue from "vue"

type ElementType<E extends Element = Element, A extends object = {}> = [E, A]

type KnownAttrs = {
  key?: Vue.VNodeProps["key"]
  ref?: Vue.VNodeProps["ref"] | { value: unknown }
  id?: string
}

interface IntrinsicElementTypes {
  button: ElementType<HTMLButtonElement, Vue.ButtonHTMLAttributes>
  input: ElementType<HTMLInputElement, Vue.InputHTMLAttributes>
  output: ElementType<HTMLOutputElement, Vue.OutputHTMLAttributes>
  textarea: ElementType<HTMLTextAreaElement, Vue.TextareaHTMLAttributes>
  label: ElementType<HTMLLabelElement, Vue.LabelHTMLAttributes>
  p: ElementType<HTMLParagraphElement, Vue.HTMLAttributes>
  ul: ElementType<HTMLUListElement, Vue.HTMLAttributes>
  ol: ElementType<HTMLOListElement, Vue.OlHTMLAttributes>
  li: ElementType<HTMLLIElement, Vue.LiHTMLAttributes>
  any: ElementType<HTMLElement | HTMLDivElement, Vue.HTMLAttributes>
}

type Booleanish = boolean | "true" | "false"
type Numberish = number | string
type Capture = boolean | "user" | "environment"

type ResolveProps<T extends object> = {
  [K in Exclude<keyof T, "checked">]?: Booleanish extends T[K]
    ? Exclude<T[K], string>
    : Numberish extends T[K]
    ? Exclude<T[K], string>
    : Capture extends T[K]
    ? Exclude<T[K], string>
    : T[K]
} & { checked?: boolean }

type ElementAttrs<E extends ElementType> = ResolveProps<E[1] & KnownAttrs>

export type VuePropTypes = {
  button: ElementAttrs<IntrinsicElementTypes["button"]>
  label: ElementAttrs<IntrinsicElementTypes["label"]>
  input: ElementAttrs<IntrinsicElementTypes["input"]>
  output: ElementAttrs<IntrinsicElementTypes["output"]>
  element: ElementAttrs<IntrinsicElementTypes["any"]>
}
