import { mergeProps as zagMergeProps } from "@zag-js/core"
import { getAttachedStyle, parseStyleString, STYLE_KEY, type StyleObject, toCssNames, toStyleProps } from "./style"

export function mergeProps(...args: Record<string | symbol, any>[]) {
  // Collect all class values (as-is, without conversion)
  // Svelte 5.15+ supports ClassValue types (string | array | object) and handles
  // the conversion internally using clsx. We collect them into an array and let
  // Svelte's native class handling resolve them at render time.
  // @see https://github.com/sveltejs/svelte/pull/14714
  const classNames: any[] = []

  for (const props of args) {
    if (!props) continue
    if ("class" in props && props.class != null) {
      classNames.push(props.class)
    }
  }

  // Styles arrive as strings (consumers) or as style attachments (normalized machine props). Later sources win.
  const styles: StyleObject[] = []
  for (const props of args) {
    if (!props) continue
    const attached = getAttachedStyle(props[STYLE_KEY])
    if (attached) styles.push(attached)
    if (props.style != null) styles.push(typeof props.style === "string" ? parseStyleString(props.style) : props.style)
  }

  const merged = zagMergeProps(...args)

  // Override class with our collected values
  // If only one value, return as-is; if multiple, return as array
  if (classNames.length > 0) {
    merged.class = classNames.length === 1 ? classNames[0] : classNames
  }

  if (styles.length > 0) {
    delete merged.style
    Object.assign(merged, toStyleProps(Object.assign({}, ...styles.map(toCssNames))))
  }

  return merged
}

