import * as Vue from "vue"

type ReservedProps = {
  key?: string | number | symbol
  ref?: string | Vue.Ref | ((ref: Element | Vue.ComponentPublicInstance | null) => void)
}

type Attrs<T> = T & ReservedProps

export type PropTypes = {
  button: Attrs<Vue.ButtonHTMLAttributes>
  input: Attrs<Vue.InputHTMLAttributes>
  output: Attrs<Vue.OutputHTMLAttributes>
  label: Attrs<Vue.LabelHTMLAttributes>
  element: Attrs<Vue.HTMLAttributes>
}
