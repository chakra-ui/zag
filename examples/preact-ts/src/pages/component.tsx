import { getComponentExamples } from "@zag-js/shared"
import { useLocation, useRoute } from "preact-iso"
import { useEffect } from "preact/hooks"

// A bare component path opens its first example
export default function ComponentPage() {
  const { params } = useRoute()
  const location = useLocation()
  const path = getComponentExamples(params.component ?? "")[0]?.path ?? "/"

  useEffect(() => {
    location.route(path, true)
  }, [path])

  return null
}
