import { Navigate, useParams } from "@solidjs/router"
import { getComponentExamples } from "@zag-js/shared"

// A bare component path opens its first example
export default function ComponentPage() {
  const params = useParams<{ component: string }>()
  return <Navigate href={getComponentExamples(params.component ?? "")[0]?.path ?? "/"} />
}
