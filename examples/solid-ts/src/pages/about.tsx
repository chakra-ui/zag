import { Suspense } from "solid-js"
import { useData } from "solid-app-router"

export default function About() {
  const data = useData()

  return (
    <section>
      <h1>About</h1>

      <p>A page all about this website.</p>

      <Suspense>
        <pre>
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      </Suspense>
    </section>
  )
}
