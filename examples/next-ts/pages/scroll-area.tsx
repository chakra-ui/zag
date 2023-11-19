import { normalizeProps, useMachine } from "@zag-js/react"
import * as scrollArea from "@zag-js/scroll-area"
import { useId, useState } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

const inserted = `
In velit excepteur proident ipsum sint dolore est in laboris. In sint velit occaecat aliquip. Velit tempor
          consequat eu sint ullamco est anim. Culpa id ut id laborum aute duis proident est laborum nulla ullamco.
          Consectetur adipisicing deserunt ea culpa exercitation dolore qui in eiusmod. Qui irure non proident laborum
          dolor exercitation commodo dolore ut dolore labore magna. Ullamco labore ea exercitation ad proident irure
          commodo aliqua excepteur deserunt.
`

export default function Page() {
  const [state, send] = useMachine(scrollArea.machine({ id: useId() }))

  const api = scrollArea.connect(state, send, normalizeProps)

  const [count, setCount] = useState(0)

  return (
    <>
      <main className="scroll-area">
        <button
          onClick={() => {
            setCount(count + 1)
          }}
        >
          Add paragraph
        </button>
        <div {...api.rootProps}>
          In velit excepteur proident ipsum sint dolore est in laboris. In sint velit occaecat aliquip. Velit tempor
          consequat eu sint ullamco est anim. Culpa id ut id laborum aute duis proident est laborum nulla ullamco.
          Consectetur adipisicing deserunt ea culpa exercitation dolore qui in eiusmod. Qui irure non proident laborum
          dolor exercitation commodo dolore ut dolore labore magna. Ullamco labore ea exercitation ad proident irure
          commodo aliqua excepteur deserunt. Amet commodo irure incididunt est culpa culpa occaecat eiusmod. Ullamco
          aliquip velit elit ipsum. Quis non fugiat ullamco qui officia adipisicing cupidatat eu pariatur cillum esse
          quis amet. Quis nulla pariatur excepteur veniam et nulla commodo. Excepteur eu voluptate aute dolore anim.
          Consectetur amet irure dolore eiusmod velit sunt. Tempor do duis est ea magna. Quis aliqua cupidatat dolor
          tempor fugiat dolor nisi aute aliquip culpa non qui. Velit et aliqua elit nulla velit. Consectetur voluptate
          amet voluptate adipisicing aute. Pariatur ea adipisicing et adipisicing qui mollit ad exercitation cillum. Sit
          in consectetur anim irure excepteur consequat aliquip magna do. Enim eu excepteur in voluptate eu labore
          voluptate aliquip. Est qui sint nulla minim irure. Excepteur mollit fugiat veniam aute minim id esse. Deserunt
          duis ipsum non duis occaecat ad proident non tempor ipsum officia eiusmod nisi consequat. Adipisicing tempor
          laboris adipisicing eiusmod ut ullamco dolor ea culpa. Cupidatat ex incididunt nostrud ea exercitation
          eiusmod. Incididunt est nostrud irure id excepteur dolor dolor excepteur sunt reprehenderit eu veniam. Est eu
          culpa duis aute sint adipisicing occaecat. Esse veniam irure dolor anim adipisicing ex dolor anim pariatur
          officia sunt ea laborum incididunt. Incididunt ad tempor laboris dolore eu sit esse in veniam pariatur in
          culpa. Lorem cupidatat fugiat ullamco amet in sunt qui ipsum mollit aute deserunt id in sint. Aute duis
          exercitation officia voluptate sunt velit veniam laborum aliqua ad amet ea reprehenderit duis. Enim pariatur
          eiusmod officia amet culpa non nostrud in ipsum irure consectetur. Enim culpa labore proident adipisicing est
          aliquip aute tempor mollit mollit. Cillum est cillum enim labore amet nostrud do aliquip qui proident dolor.
          Laboris mollit consequat esse voluptate officia commodo anim. Qui consectetur duis duis qui ex est cillum
          nostrud ipsum dolore. Pariatur ea dolor eu nostrud aliquip anim culpa ut minim minim. Non sit deserunt ullamco
          aute excepteur ex dolor reprehenderit dolor. Anim in aliqua dolore Lorem sint elit esse culpa consequat
          consequat occaecat. Velit incididunt ipsum labore pariatur adipisicing elit laboris cillum eu ullamco elit
          non. Aute ipsum sit consequat ullamco non consectetur. Id fugiat aliqua ipsum ea esse nulla nulla exercitation
          fugiat eiusmod. Reprehenderit consectetur velit consectetur enim deserunt nulla amet aliqua. Commodo ullamco
          irure nisi excepteur nulla. Esse sit duis Lorem cupidatat culpa occaecat cupidatat eu dolor quis adipisicing
          enim. Do reprehenderit esse veniam anim officia laborum laborum. Dolore eu amet dolore mollit proident ut in
          nostrud. Aliquip adipisicing aliquip cillum voluptate amet consectetur deserunt et excepteur ea. Commodo duis
          culpa elit excepteur nostrud est proident elit nostrud nostrud in fugiat velit. Non ea exercitation quis est
          est irure.
          {count && <span>{inserted.repeat(count)}</span>}
        </div>
        {!api.isSticky && (
          <button
            onClick={() => {
              api.scrollToSticky()
            }}
          >
            Make sticky
          </button>
        )}
      </main>

      <Toolbar viz>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
