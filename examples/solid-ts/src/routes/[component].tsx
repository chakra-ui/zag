import { useNavigate, useParams } from "@solidjs/router"
import { getComponentExamples } from "@zag-js/shared"
import { onSettled } from "solid-js"

// A bare component path opens its first example
export default function ComponentPage() {
  const params = useParams<{ component: string }>()
  const navigate = useNavigate()
  onSettled(() => {
    navigate(getComponentExamples(params.component ?? "")[0]?.path ?? "/", { replace: true })
  })
  return null
}
