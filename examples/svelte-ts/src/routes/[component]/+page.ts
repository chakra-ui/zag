import { redirect } from "@sveltejs/kit"
import { getComponentExamples } from "@zag-js/shared"

// A bare component path opens its first example
export function load({ params }) {
  redirect(307, getComponentExamples(params.component)[0]?.path ?? "/")
}
