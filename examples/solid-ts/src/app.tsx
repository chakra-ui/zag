import { useRoutes } from "solid-app-router"
import type { Component } from "solid-js"
import { routes } from "./routes"

const App: Component = () => {
  const Route = useRoutes(routes)

  return (
    <main>
      <Route />
    </main>
  )
}

export default App
